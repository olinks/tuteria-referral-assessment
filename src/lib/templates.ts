import type { ReferralEmailContext } from "./types";

/**
 * Renders the `medbuddy_referral_followup` template referenced in the
 * original snippet. In production this would live in Postmark's template
 * store; here we render it inline from the same `context` variables.
 */
export function renderReferralFollowupEmail(
  template: string,
  ctx: ReferralEmailContext
): { subject: string; html: string } {
  if (template !== "medbuddy_referral_followup") {
    throw new Error(`Unknown template: ${template}`);
  }

  const money = formatMoney(ctx.currency, ctx.referral_value);
  const subject = `You earned ${money} — ${ctx.referred_user_name} joined ${ctx.course_name}`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2933;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#0b7285;padding:20px 32px;">
            <span style="color:#ffffff;font-size:20px;font-weight:bold;">Medbuddy</span>
          </td></tr>
          <tr><td style="padding:32px;">
            <p style="font-size:16px;margin:0 0 16px;">Hi ${escapeHtml(ctx.user_first_name)},</p>
            <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
              Great news! <strong>${escapeHtml(ctx.referred_user_name)}</strong>,
              who you referred, just enrolled in
              <strong>${escapeHtml(ctx.course_name)}</strong>.
            </p>
            <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">
              Your referral reward of <strong>${money}</strong> is on its way.
              You can track all your referrals and rewards on your dashboard.
            </p>
            <p style="margin:0 0 28px;">
              <a href="${ctx.referral_tracking_page_url}"
                 style="background:#0b7285;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:15px;display:inline-block;">
                View my referrals
              </a>
            </p>
            <p style="font-size:13px;color:#7b8794;line-height:1.5;margin:0;">
              Keep referring friends to earn more. This email was sent to
              ${escapeHtml(ctx.recipient)}.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}

function formatMoney(currency: string, amount: number): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
