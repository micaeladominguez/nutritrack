import { createBrowserClient } from "@supabase/ssr";

// Singleton browser client — safe to call from any Client Component
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
