import "server-only";

import { ProviderError, errorFromResponse } from "@/lib/integrations/errors";
import type { Fetcher, NormalizedSocialStats } from "@/lib/integrations/types";

export async function fetchInstagramStats(accessToken: string, fetcher: Fetcher = fetch): Promise<NormalizedSocialStats> {
  const url = new URL("https://graph.instagram.com/me");
  url.searchParams.set("fields", "id,user_id,username,name,profile_picture_url,followers_count,media_count");
  const response = await fetcher(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw errorFromResponse(response.status);
  const user = await response.json() as Record<string, unknown>;
  const id = typeof user.id === "string" ? user.id : typeof user.user_id === "string" || typeof user.user_id === "number" ? String(user.user_id) : null;
  if (!id) throw new ProviderError("malformed_provider_response", "No Instagram professional account was found.");
  const count = (key: string) => typeof user[key] === "number" && Number.isFinite(user[key]) ? user[key] as number : null;
  const username = typeof user.username === "string" ? user.username : null;
  return { provider: "instagram", providerUserId: id, displayName: typeof user.name === "string" ? user.name : username, username, avatarUrl: typeof user.profile_picture_url === "string" ? user.profile_picture_url : null, followers: count("followers_count"), following: null, likes: null, videos: count("media_count") };
}
