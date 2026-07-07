import { NextRequest, NextResponse } from "next/server";
import { post_to_cdn_postmark_service } from "@/lib/mailService";
import { settings } from "@/lib/settings";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    referrerName,
    referrerEmail,
    referredName,
    courseName,
    currency,
    referralAmount,
  } = body;

  if (
    !referrerName ||
    !referrerEmail ||
    !referredName ||
    !courseName ||
    !currency ||
    referralAmount === undefined
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const result = await post_to_cdn_postmark_service("/send-mail", {
      to: referrerEmail,
      from: settings.MAIL_FROM,
      context: {
        user_first_name: (referrerName || "").split(" ")[0],
        referred_user_name: referredName,
        course_name: courseName,
        currency,
        referral_value: referralAmount,
        referral_tracking_page_url: `${settings.WEBSITE_URL}/app/referrals`,
        recipient: referrerEmail,
      },
      template: "medbuddy_referral_followup",
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
