import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { settings } from "./settings";

/**
 * Server-side Supabase client. Uses the service-role key when available
 * (server only) so the referral endpoint can read/write regardless of RLS.
 * Falls back to the anon key for read-only/local use.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (cached) return cached;
  const key =
    settings.SUPABASE_SERVICE_ROLE_KEY || settings.SUPABASE_ANON_KEY;
  if (!settings.SUPABASE_URL || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and a key."
    );
  }
  cached = createClient(settings.SUPABASE_URL, key, {
    auth: { persistSession: false },
  });
  return cached;
}

/** Browser client (anon key) for client components. */
export function getSupabaseBrowser(): SupabaseClient {
  return createClient(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}
