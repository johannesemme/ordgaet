// Importing "server-only" makes the build FAIL if this file is ever pulled
// into a Client Component. That turns "we must never leak the service role
// key to the browser" from a rule people have to remember into a rule the
// compiler enforces.
import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with the service role key.
 *
 * The service role bypasses Row Level Security entirely, which is exactly what
 * we want on the server and exactly what must never reach a browser. The word
 * list and the answer to an active game are only ever read through this client.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Fail loudly at the point of use rather than sending confusing 401s later.
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  return createClient(url, key, {
    // No browser here, so there is no session to persist or refresh.
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
