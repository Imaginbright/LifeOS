import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { revokeYouTubeToken } from "@/lib/integrations/youtube/oauth";
import { revokeTikTokToken } from "@/lib/integrations/tiktok/oauth";

export async function POST(_: Request, { params }: { params: Promise<{ platform: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const { platform } = await params; if (!["youtube", "tiktok"].includes(platform)) return NextResponse.json({ error: "Provider is not available" }, { status: 400 });
  const admin = createAdminClient();
  const { data: account } = await admin.from("connected_accounts").select("id,user_id").eq("user_id", auth.user.id).eq("platform", platform).maybeSingle();
  if (!account || account.user_id !== auth.user.id) return NextResponse.json({ error: "Connected account not found" }, { status: 404 });
  const { data: token } = await admin.from("oauth_credentials").select("access_token").eq("connected_account_id", account.id).maybeSingle();
  if (token?.access_token) {
    try { if (platform === "youtube") await revokeYouTubeToken(token.access_token); else await revokeTikTokToken(token.access_token); } catch { /* Revocation is best effort; local credential removal still proceeds. */ }
  }
  const { error: credentialError } = await admin.from("oauth_credentials").delete().eq("connected_account_id", account.id);
  if (credentialError) return NextResponse.json({ error: "Stored credentials could not be removed" }, { status: 500 });
  const { error } = await admin.from("connected_accounts").update({ status: "not_connected", disconnected_at: new Date().toISOString(), last_error: null }).eq("id", account.id);
  if (error) return NextResponse.json({ error: "The account could not be disconnected" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
