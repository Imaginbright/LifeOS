import "server-only";

import { publicEnv, required } from "@/lib/env";

export const serverEnv = () => ({
  ...publicEnv(),
  supabaseSecretKey: required("SUPABASE_SECRET_KEY"),
});
