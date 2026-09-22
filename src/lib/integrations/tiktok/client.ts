import "server-only";

import { ProviderError, errorFromResponse } from "@/lib/integrations/errors";
import type { Fetcher, NormalizedSocialStats } from "@/lib/integrations/types";

export async function fetchTikTokStats(accessToken: string, grantedScopes: string[], fetcher: Fetcher = fetch): Promise<NormalizedSocialStats> {
  if (!grantedScopes.includes("user.info.basic")) throw new ProviderError("missing_scope");
  const fields = ["open_id", "avatar_url", "display_name", ...(grantedScopes.includes("user.info.stats") ? ["follower_count", "following_count", "likes_count", "video_count"] : [])];
  const url = new URL("https://open.tiktokapis.com/v2/user/info/"); url.searchParams.set("fields", fields.join(","));
  const response = await fetcher(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw errorFromResponse(response.status);
  const body = await response.json() as { data?: { user?: Record<string, unknown> }; error?: { code?: string } };
  const user = body.data?.user;
  if (!user || typeof user.open_id !== "string") throw new ProviderError("malformed_provider_response");
  const count = (key: string) => typeof user[key] === "number" ? user[key] as number : null;
  return { provider: "tiktok", providerUserId: user.open_id, displayName: typeof user.display_name === "string" ? user.display_name : null, username: null, avatarUrl: typeof user.avatar_url === "string" ? user.avatar_url : null, followers: count("follower_count"), following: count("following_count"), likes: count("likes_count"), videos: count("video_count") };
}

