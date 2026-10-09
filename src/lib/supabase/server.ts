import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Database } from "@/lib/database.types";
import { publicEnv } from "@/lib/env";

export const createClient = cache(async () => {
  const cookieStore = await cookies();
  const env = publicEnv();

  return createServerClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies. proxy.ts refreshes the session.
        }
      },
    },
  });
});

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  return supabase.auth.getUser();
});

