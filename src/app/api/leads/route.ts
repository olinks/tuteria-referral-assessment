import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * GET /api/leads
 * Returns pending referral leads with enough joined context for the UI
 * to render a "send referral email" list. Each lead includes the referrer
 * (who gets the reward email) and the referred user + course.
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("leads")
      .select(
        `id, currency, referral_amount,
         referrer:users!leads_referrer_id_fkey(id, name, email),
         user:users!leads_user_id_fkey(id, name, email),
         course:courses(id, name)`
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const leads = (data || []).map((l: any) => ({
      id: l.id,
      currency: l.currency,
      referral_amount: l.referral_amount,
      referrer: pickOne(l.referrer),
      referredUser: pickOne(l.user),
      course: pickOne(l.course),
    }));

    return NextResponse.json({ leads });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function pickOne<T>(v: T | T[]): T {
  return Array.isArray(v) ? v[0] : v;
}
