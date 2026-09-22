import "server-only";

import { ProviderError, errorFromResponse } from "@/lib/integrations/errors";
import type { Fetcher, NormalizedSocialStats } from "@/lib/integrations/types";

export async function fetchYouTubeStats(accessToken: string, fetcher: Fetcher = fetch): Promise<NormalizedSocialStats> {
  const url = new URL("https://www.googleapis.com/youtube/v3/channels");
  url.search = new URLSearchParams({ part: "snippet,statistics", mine: "true" }).toString();
  const response = await fetcher(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw errorFromResponse(response.status);
  const body = await response.json() as { items?: Array<{ id?: string; snippet?: { title?: string; thumbnails?: { high?: { url?: string }; default?: { url?: string } } }; statistics?: { subscriberCount?: string; videoCount?: string; hiddenSubscriberCount?: boolean } }> };
  const channel = body.items?.[0];
  if (!channel?.id) throw new ProviderError("malformed_provider_response", "No YouTube channel was found for this account.");
  const subscribers = channel.statistics?.hiddenSubscriberCount ? null : channel.statistics?.subscriberCount;
  return { provider: "youtube", providerUserId: channel.id, displayName: channel.snippet?.title ?? null, username: null, avatarUrl: channel.snippet?.thumbnails?.high?.url ?? channel.snippet?.thumbnails?.default?.url ?? null, followers: subscribers == null ? null : Number(subscribers), following: null, likes: null, videos: channel.statistics?.videoCount === undefined ? null : Number(channel.statistics.videoCount) };
}
