import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { jsonBody } from "@/lib/api-response";
import { settledSyncResults, syncConnectedAccount } from "@/lib/integrations/sync";

export async function POST(request: Request) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); const platform = typeof body?.platform === "string" ? body.platform : undefined;
  let query = auth.supabase.from("connected_accounts").select("id,platform,last_synced_at").eq("user_id", auth.user.id).eq("status", "connected");
  if (platform) query = query.eq("platform", platform);
  const { data, error } = await query; if (error) return NextResponse.json({ error: "Connected accounts could not be loaded" }, { status: 500 });
  const eligible = (data ?? []).filter((account) => !account.last_synced_at || Date.now() - new Date(account.last_synced_at).getTime() >= 60_000);
  if (!eligible.length) return NextResponse.json({ status: "skipped", message: "This account was synced less than a minute ago." });
  const settled = await Promise.allSettled(eligible.map((account) => syncConnectedAccount(account.id, auth.user.id)));
  const results = settledSyncResults(eligible, settled);
  if (results.some((result) => result.status === "success")) {
    revalidatePath("/dashboard");
    revalidatePath("/creator");
    revalidatePath("/settings");
  }
  return NextResponse.json({ results });
}

