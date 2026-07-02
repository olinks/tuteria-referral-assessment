import { settings } from "./settings";
import type { AppUser, Lead } from "./types";
import {
  post_to_cdn_postmark_service,
  type PostmarkServiceResult,
} from "./mailService";

/**
 * Port of the original snippet's function-usage block:
 *
 *   post_to_cdn_postmark_service("/send-mail", {
 *     "to": user.email,
 *     "from": "Medbuddy <info@medbuddyafrica.com>",
 *     "context": {
 *        "user_first_name": (user.name or "").split(" ")[0],
 *        "referred_user_name": lead.user.name,
 *        "course_name": lead.course.name,
 *        "currency": currency,
 *        "referral_value": referral_amount,
 *        "referral_tracking_page_url": f"{settings.WEBSITE_URL}/app/referrals",
 *        "recipient": user.email,
 *     },
 *     "template": "medbuddy_referral_followup",
 *   })
 *
 * `user` is the referrer receiving the reward email; `lead` carries the
 * referred user + course + reward amount.
 */
export async function sendReferralFollowup(
  user: AppUser,
  lead: Lead
): Promise<PostmarkServiceResult> {
  const currency = lead.currency;
  const referral_amount = lead.referral_amount;

  return post_to_cdn_postmark_service("/send-mail", {
    to: user.email,
    from: settings.MAIL_FROM,
    context: {
      user_first_name: (user.name || "").split(" ")[0],
      referred_user_name: lead.user.name,
      course_name: lead.course.name,
      currency,
      referral_value: referral_amount,
      referral_tracking_page_url: `${settings.WEBSITE_URL}/app/referrals`,
      recipient: user.email,
    },
    template: "medbuddy_referral_followup",
  });
}
