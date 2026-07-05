import { describe, it, expect, vi, beforeEach } from "vitest";

// Ensure no real API key so the service returns a preview (no network call).
vi.stubEnv("RESEND_API_KEY", "");
vi.stubEnv("NEXT_PUBLIC_WEBSITE_URL", "https://demo.example.com");

import { post_to_cdn_postmark_service } from "@/lib/mailService";
import { sendReferralFollowup } from "@/lib/referral";
import { settings } from "@/lib/settings";
import type { AppUser, Lead } from "@/lib/types";

const referrer: AppUser = {
  id: "u1",
  name: "Olayinka Joseph",
  email: "referrer@example.com",
};

const lead: Lead = {
  id: "l1",
  currency: "NGN",
  referral_amount: 5000,
  user: { id: "u2", name: "Amaka Obi", email: "amaka@example.com" },
  course: { id: "c1", name: "Medical Coding Fundamentals" },
};

describe("post_to_cdn_postmark_service", () => {
  it("returns a preview when no API key is configured", async () => {
    const res = await post_to_cdn_postmark_service("/send-mail", {
      to: referrer.email,
      from: "Medbuddy <onboarding@resend.dev>",
      context: {
        user_first_name: "Olayinka",
        referred_user_name: "Amaka Obi",
        course_name: "Medical Coding Fundamentals",
        currency: "NGN",
        referral_value: 5000,
        referral_tracking_page_url: "https://demo.example.com/app/referrals",
        recipient: referrer.email,
      },
      template: "medbuddy_referral_followup",
    });

    expect(res.status).toBe("preview");
    expect(res.preview?.subject).toContain("Amaka Obi");
  });

  it("rejects unsupported paths", async () => {
    await expect(
      post_to_cdn_postmark_service("/wrong", {
        to: "a@b.com",
        from: "x",
        context: {} as any,
        template: "medbuddy_referral_followup",
      })
    ).rejects.toThrow(/Unsupported mail service path/);
  });
});

describe("sendReferralFollowup — context assembly (port of the snippet)", () => {
  it("derives first name and tracking url exactly like the original", async () => {
    const res = await sendReferralFollowup(referrer, lead);
    expect(res.status).toBe("preview");
    // first name is split from the referrer's full name
    expect(res.preview?.html).toContain("Olayinka");
    // tracking url is `${WEBSITE_URL}/app/referrals`
    expect(res.preview?.html).toContain(
      `${settings.WEBSITE_URL}/app/referrals`
    );
    // referred user's name appears
    expect(res.preview?.html).toContain("Amaka Obi");
  });

  it("handles an empty referrer name without crashing", async () => {
    const res = await sendReferralFollowup(
      { ...referrer, name: "" },
      lead
    );
    expect(res.status).toBe("preview");
  });

  it("flags false positives and throws if referred user data is missing", async () => {
    const badLead = { ...lead, user: undefined } as any;
    await expect(sendReferralFollowup(referrer, badLead)).rejects.toThrow();
  });

  it("flags false positives and throws if course data is missing", async () => {
    const badLead = { ...lead, course: undefined } as any;
    await expect(sendReferralFollowup(referrer, badLead)).rejects.toThrow();
  });
});
