import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { serverEnv } from "@/lib/env-server";

export function createAdminClient() {
  const env = serverEnv();
  return createClient<Database>(env.supabaseUrl, env.supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
