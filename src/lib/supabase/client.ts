"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { publicEnv } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (!browserClient) {
    const env = publicEnv();
    browserClient = createBrowserClient<Database>(env.supabaseUrl, env.supabasePublishableKey);
  }
  return browserClient;
}

