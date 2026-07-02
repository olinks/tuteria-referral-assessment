import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";
import { sendReferralFollowup } from "@/lib/referral";
import type { AppUser, Lead } from "@/lib/types";

export const runtime = "nodejs";

/**
 * POST /api/referral/send
 * Body: { referrerId: string, leadId: string }
 *
 * Loads the referrer (user) and the lead (referred user + course + reward)
 * from Supabase, then dispatches the referral follow-up email — the exact
 * action the original snippet performs.
 */
export async function POST(req: NextRequest) {
  let body: { referrerId?: string; leadId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { referrerId, leadId } = body;
  if (!referrerId || !leadId) {
    return NextResponse.json(
      { error: "referrerId and leadId are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseServer();

    // Referrer (the user receiving the reward email)
    const { data: referrer, error: rErr } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("id", referrerId)
      .single();
    if (rErr || !referrer) {
      return NextResponse.json(
        { error: "Referrer not found" },
        { status: 404 }
      );
    }

    // Lead joined to referred user + course
    const { data: lead, error: lErr } = await supabase
      .from("leads")
      .select(
        "id, currency, referral_amount, user:users!leads_user_id_fkey(id, name, email), course:courses(id, name)"
      )
      .eq("id", leadId)
      .single();
    if (lErr || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Supabase returns joined relations as arrays in some configs — normalize.
    const referredUser = Array.isArray(lead.user) ? lead.user[0] : lead.user;
    const course = Array.isArray(lead.course) ? lead.course[0] : lead.course;

    const normalizedLead: Lead = {
      id: lead.id,
      currency: lead.currency,
      referral_amount: lead.referral_amount,
      user: referredUser as AppUser,
      course: course as { id: string; name: string },
    };

    const result = await sendReferralFollowup(
      referrer as AppUser,
      normalizedLead
    );

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
