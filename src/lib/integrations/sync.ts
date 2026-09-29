import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { safeProviderError, ProviderError } from "./errors";
import { fetchYouTubeStats } from "./youtube/client";
import { refreshYouTubeToken } from "./youtube/oauth";
import { fetchTikTokStats } from "./tiktok/client";
import { refreshTikTokToken } from "./tiktok/oauth";
import { fetchInstagramStats } from "./instagram/client";
import { refreshInstagramToken } from "./instagram/oauth";
import { syncInboxForUser } from "@/lib/inbox-sync";
import { shouldRefreshToken } from "./token-utils";
import { snapshotValues } from "./persist";
import type { SocialProviderName } from "./types";

export function settledSyncResults(accounts: Array<{ platform: string }>, settled: PromiseSettledResult<{ provider: string; status: "success" }>[]) {
  return settled.map((result, index) => result.status === "fulfilled" ? result.value : { provider: accounts[index].platform, status: "failed" as const, error: safeProviderError(result.reason).code });
}

export async function syncConnectedAccount(accountId: string, ownerId?: string) {
  const admin = createAdminClient();
  const { data: account, error: accountError } = await admin.from("connected_accounts").select("id,user_id,platform,status,granted_scopes").eq("id", accountId).single();
  if (accountError || !account || (ownerId && account.user_id !== ownerId)) throw new ProviderError("authorization_denied", "This connected account is not available.");
  const { data: credential, error: credentialError } = await admin.from("oauth_credentials").select("access_token,refresh_token,expires_at,refresh_expires_at,token_type,scope").eq("connected_account_id", account.id).single();
  if (credentialError || !credential) {
    const missing = new ProviderError("token_expired");
    await admin.from("connected_accounts").update({ status: "token_expired", last_error: missing.message }).eq("id", account.id);
    await syncInboxForUser(account.user_id).catch(() => undefined);
    throw missing;
  }

  try {
    let accessToken = credential.access_token;
    const refreshWindow = account.platform === "instagram" ? 7 * 86_400_000 : 5 * 60_000;
    if (shouldRefreshToken(credential.expires_at, Date.now(), refreshWindow)) {
      if (!credential.refresh_token) throw new ProviderError("token_expired");
      const refreshed = account.platform === "youtube" ? await refreshYouTubeToken(credential.refresh_token) : account.platform === "tiktok" ? await refreshTikTokToken(credential.refresh_token) : await refreshInstagramToken(credential.refresh_token);
      accessToken = refreshed.accessToken;
      const { error } = await admin.from("oauth_credentials").update({ access_token: refreshed.accessToken, refresh_token: refreshed.refreshToken ?? credential.refresh_token, expires_at: refreshed.accessTokenExpiresAt, refresh_expires_at: refreshed.refreshTokenExpiresAt ?? credential.refresh_expires_at, token_type: refreshed.tokenType, scope: refreshed.scope ?? credential.scope }).eq("connected_account_id", account.id);
      if (error) throw error;
    }
    const stats = account.platform === "youtube" ? await fetchYouTubeStats(accessToken) : account.platform === "tiktok" ? await fetchTikTokStats(accessToken, account.granted_scopes) : await fetchInstagramStats(accessToken);
    const now = new Date().toISOString();
    const { error: updateError } = await admin.from("connected_accounts").update({ external_account_id: stats.providerUserId, display_name: stats.displayName || account.platform, username: stats.username, avatar_url: stats.avatarUrl, status: "connected", last_synced_at: now, last_error: null }).eq("id", account.id);
    if (updateError) throw updateError;
    const { error: snapshotError } = await admin.from("social_snapshots").insert(snapshotValues(account.user_id, account.id, stats, now));
    if (snapshotError) throw snapshotError;
    await syncInboxForUser(account.user_id);
    return { provider: account.platform as SocialProviderName, status: "success" as const };
  } catch (error) {
    const safe = safeProviderError(error);
    await admin.from("connected_accounts").update({ status: ["token_expired", "token_refresh_failed", "authorization_denied"].includes(safe.code) ? "token_expired" : "error", last_error: safe.message }).eq("id", account.id);
    await syncInboxForUser(account.user_id).catch(() => undefined);
    throw safe;
  }
}
