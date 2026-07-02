import { Resend } from "resend";
import { settings } from "./settings";
import type { ReferralEmailContext } from "./types";
import { renderReferralFollowupEmail } from "./templates";

/**
 * Shape mirrors the original Python call:
 *
 *   post_to_cdn_postmark_service("/send-mail", {
 *     to, from, context, template,
 *   })
 *
 * In the original, this POSTs to an internal CDN/Postmark microservice.
 * Here we implement the same contract but send via Resend (a verified
 * transactional email provider), keeping the identical input signature.
 */
export interface PostmarkServicePayload {
  to: string;
  from: string;
  context: ReferralEmailContext;
  template: string;
}

export interface PostmarkServiceResult {
  status: "sent" | "preview";
  id?: string;
  // When the provider can't deliver (e.g. unverified recipient on a new
  // account), we still return the composed email so the flow never hard-fails.
  preview?: { subject: string; html: string };
  error?: string;
}

/**
 * Direct analogue of the snippet's `post_to_cdn_postmark_service`.
 * `path` is kept for signature fidelity ("/send-mail").
 */
export async function post_to_cdn_postmark_service(
  path: string,
  payload: PostmarkServicePayload
): Promise<PostmarkServiceResult> {
  if (path !== "/send-mail") {
    throw new Error(`Unsupported mail service path: ${path}`);
  }

  const { subject, html } = renderReferralFollowupEmail(
    payload.template,
    payload.context
  );

  // No API key configured (e.g. CI without secrets) → return preview so the
  // pipeline and tests stay green without attempting a real network send.
  if (!settings.RESEND_API_KEY) {
    return { status: "preview", preview: { subject, html } };
  }

  try {
    const resend = new Resend(settings.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: payload.from,
      to: payload.to,
      subject,
      html,
    });

    if (error) {
      // Provider rejected (e.g. new account can only send to verified
      // address). Degrade gracefully to a preview instead of throwing.
      return {
        status: "preview",
        preview: { subject, html },
        error: error.message,
      };
    }
    return { status: "sent", id: data?.id };
  } catch (err) {
    return {
      status: "preview",
      preview: { subject, html },
      error: err instanceof Error ? err.message : "Unknown send error",
    };
  }
}
