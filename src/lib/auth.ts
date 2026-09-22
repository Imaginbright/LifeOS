import "server-only";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { response: NextResponse.json({ error: "Authentication required" }, { status: 401 }) } as const;
  return { supabase, user } as const;
}

