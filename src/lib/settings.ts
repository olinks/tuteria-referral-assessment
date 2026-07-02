/**
 * Central config — mirrors the `settings.*` object referenced in the
 * original Tuteria pseudo-code (settings.WEBSITE_URL, settings.CDN_SERVICE, etc.).
 * All values are read from environment variables so nothing secret is committed.
 */
export const settings = {
  WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000",

  // Email transport (Resend)
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  MAIL_FROM: process.env.MAIL_FROM || "Medbuddy <onboarding@resend.dev>",

  // Supabase (BaaS)
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
} as const;

export const DEFAULT_REFERRAL_AMOUNT = 5000; // in minor display units per currency
export const DEFAULT_CURRENCY = "NGN";
