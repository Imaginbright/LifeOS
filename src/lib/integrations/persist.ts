import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { NormalizedSocialStats, ProviderTokens } from "./types";

export async function saveConnection(userId: string, stats: NormalizedSocialStats, tokens: ProviderTokens, scopes: string[], environment: "sandbox" | "production" | null) {
  const admin = createAdminClient(); const now = new Date().toISOString();
  const { data: account, error } = await admin.from("connected_accounts").upsert({ user_id: userId, platform: stats.provider, external_account_id: stats.providerUserId, display_name: stats.displayName || stats.provider, username: stats.username, avatar_url: stats.avatarUrl, status: "connected", granted_scopes: scopes, environment, connected_at: now, disconnected_at: null, last_synced_at: now, last_error: null }, { onConflict: "user_id,platform" }).select().single();
  if (error) throw error;
  const { error: tokenError } = await admin.from("oauth_credentials").upsert({ connected_account_id: account.id, access_token: tokens.accessToken, refresh_token: tokens.refreshToken, expires_at: tokens.accessTokenExpiresAt, refresh_expires_at: tokens.refreshTokenExpiresAt, token_type: tokens.tokenType, scope: tokens.scope }, { onConflict: "connected_account_id" });
  if (tokenError) {
    await admin.from("connected_accounts").update({ status: "error", last_error: "Credentials could not be stored securely." }).eq("id", account.id);
    throw tokenError;
  }
  const { error: snapshotError } = await admin.from("social_snapshots").insert({ connected_account_id: account.id, user_id: userId, provider: stats.provider, followers: stats.followers, following: stats.following, likes: stats.likes, videos: stats.videos, captured_at: now });
  if (snapshotError) {
    await admin.from("connected_accounts").update({ status: "error", last_error: "The first statistics snapshot could not be saved." }).eq("id", account.id);
    throw snapshotError;
  }
  return account;
}
