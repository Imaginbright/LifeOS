import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { settledSyncResults, syncConnectedAccount } from "@/lib/integrations/sync";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Automatic synchronization is not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient(); const { data, error } = await admin.from("connected_accounts").select("id,platform").eq("status", "connected").in("platform", ["youtube", "tiktok", "instagram"]);
  if (error) return NextResponse.json({ error: "Connected accounts could not be loaded" }, { status: 500 });
  const settled = await Promise.allSettled((data ?? []).map((account) => syncConnectedAccount(account.id)));
  const results = settledSyncResults(data ?? [], settled);
  return NextResponse.json({ results });
}
