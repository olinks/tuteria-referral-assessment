import { describe, it, expect } from "vitest";
import { renderReferralFollowupEmail } from "@/lib/templates";
import type { ReferralEmailContext } from "@/lib/types";

const ctx: ReferralEmailContext = {
  user_first_name: "Olayinka",
  referred_user_name: "Amaka Obi",
  course_name: "Medical Coding Fundamentals",
  currency: "NGN",
  referral_value: 5000,
  referral_tracking_page_url: "https://example.com/app/referrals",
  recipient: "referrer@example.com",
};

describe("renderReferralFollowupEmail", () => {
  it("renders subject with referred user, course, and formatted amount", () => {
    const { subject } = renderReferralFollowupEmail(
      "medbuddy_referral_followup",
      ctx
    );
    expect(subject).toContain("Amaka Obi");
    expect(subject).toContain("Medical Coding Fundamentals");
    expect(subject).toMatch(/₦|NGN/);
  });

  it("includes referrer first name and tracking url in the body", () => {
    const { html } = renderReferralFollowupEmail(
      "medbuddy_referral_followup",
      ctx
    );
    expect(html).toContain("Olayinka");
    expect(html).toContain("https://example.com/app/referrals");
    expect(html).toContain("referrer@example.com");
  });

  it("escapes HTML in user-provided fields", () => {
    const { html } = renderReferralFollowupEmail("medbuddy_referral_followup", {
      ...ctx,
      referred_user_name: "<script>alert(1)</script>",
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("throws on unknown template", () => {
    expect(() =>
      renderReferralFollowupEmail("nope", ctx)
    ).toThrow(/Unknown template/);
  });
});
