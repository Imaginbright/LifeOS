import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchYouTubeStats } from "../src/lib/integrations/youtube/client";
import { fetchTikTokStats } from "../src/lib/integrations/tiktok/client";
import { ProviderError } from "../src/lib/integrations/errors";
import { exchangeYouTubeCode, refreshYouTubeToken } from "../src/lib/integrations/youtube/oauth";
import { exchangeTikTokCode } from "../src/lib/integrations/tiktok/oauth";

const jsonFetch = (body: unknown, status = 200) => (async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })) as typeof fetch;

test("YouTube client normalizes channel statistics and hidden subscribers", async () => {
  const visible = await fetchYouTubeStats("token", jsonFetch({ items: [{ id: "channel-1", snippet: { title: "Bright", thumbnails: { high: { url: "https://example.com/avatar.jpg" } } }, statistics: { subscriberCount: "2941", videoCount: "24" } }] }));
  assert.equal(visible.providerUserId, "channel-1"); assert.equal(visible.followers, 2941); assert.equal(visible.videos, 24);
  const hidden = await fetchYouTubeStats("token", jsonFetch({ items: [{ id: "channel-2", snippet: { title: "Private" }, statistics: { hiddenSubscriberCount: true } }] }));
  assert.equal(hidden.followers, null);
});

test("TikTok client requests only granted fields and normalizes stats", async () => {
  let requested = "";
  const fetcher = (async (input: string | URL | Request) => { requested = String(input); return new Response(JSON.stringify({ data: { user: { open_id: "open-1", display_name: "Bright", avatar_url: "https://example.com/a.jpg", follower_count: 80, following_count: 12, likes_count: 400, video_count: 9 } } }), { status: 200 }); }) as typeof fetch;
  const stats = await fetchTikTokStats("token", ["user.info.basic", "user.info.stats"], fetcher);
  assert.match(requested, /follower_count/); assert.equal(stats.followers, 80); assert.equal(stats.likes, 400);
  await assert.rejects(() => fetchTikTokStats("token", ["user.info.stats"], fetcher), (error: unknown) => error instanceof ProviderError && error.code === "missing_scope");
});

test("provider clients classify rate limits without exposing response bodies", async () => {
  await assert.rejects(() => fetchYouTubeStats("token", jsonFetch({ access_token: "must-not-surface" }, 429)), (error: unknown) => error instanceof ProviderError && error.code === "provider_rate_limited" && !error.message.includes("must-not-surface"));
});

test("Google token exchange parses expiry and preserves an existing refresh token", async () => {
  process.env.GOOGLE_CLIENT_ID = "test-client"; process.env.GOOGLE_CLIENT_SECRET = "test-secret"; process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  let requestBody = "";
  const exchangeFetch = (async (_input: string | URL | Request, init?: RequestInit) => { requestBody = String(init?.body); return new Response(JSON.stringify({ access_token: "access", refresh_token: "refresh", expires_in: 3600, token_type: "Bearer", scope: "https://www.googleapis.com/auth/youtube.readonly" }), { status: 200 }); }) as typeof fetch;
  const exchanged = await exchangeYouTubeCode("code", exchangeFetch);
  assert.equal(exchanged.refreshToken, "refresh"); assert.match(requestBody, /grant_type=authorization_code/); assert.ok(exchanged.accessTokenExpiresAt);
  const refreshFetch = jsonFetch({ access_token: "new-access", expires_in: 3600, token_type: "Bearer" });
  const refreshed = await refreshYouTubeToken("keep-this-refresh", refreshFetch);
  assert.equal(refreshed.refreshToken, "keep-this-refresh");
});

test("TikTok token exchange parses rotating token metadata", async () => {
  process.env.TIKTOK_CLIENT_KEY = "test-key"; process.env.TIKTOK_CLIENT_SECRET = "test-secret"; process.env.NEXT_PUBLIC_APP_URL = "https://lifeos-navy-six.vercel.app";
  const fetcher = jsonFetch({ access_token: "access", refresh_token: "rotated", expires_in: 86400, refresh_expires_in: 31536000, token_type: "Bearer", scope: "user.info.basic,user.info.stats" });
  const tokens = await exchangeTikTokCode("code", fetcher);
  assert.equal(tokens.refreshToken, "rotated"); assert.equal(tokens.scope, "user.info.basic,user.info.stats"); assert.ok(tokens.refreshTokenExpiresAt);
});
