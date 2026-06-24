import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/env";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createClient(): SupabaseClient<Database> {
  const { url, anonKey } = getSupabaseEnv();

  return createBrowserClient<Database>(url, anonKey) as unknown as SupabaseClient<Database>;
}
