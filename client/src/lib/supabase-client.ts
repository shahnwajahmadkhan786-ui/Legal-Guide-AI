import { createClient } from "@supabase/supabase-js";

// These are public keys — safe to include in client bundle.
// The Row Level Security (RLS) policies on Supabase protect the data.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set. Auth and analytics will not work."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Needed for OAuth redirect
  },
});

// ── Analytics helper ─────────────────────────────────────────────────────────
// Tracks events server-side via our Express proxy (which has the service_role key)
export async function trackEvent(
  eventType: string,
  metadata?: Record<string, any>
) {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, metadata }),
    });
  } catch {
    // Analytics is best-effort — never block the UI
  }
}
