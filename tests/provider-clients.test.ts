import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchYouTubeStats } from "../src/lib/integrations/youtube/client";
import { fetchTikTokStats } from "../src/lib/integrations/tiktok/client";
import { ProviderError } from "../src/lib/integrations/errors";
import { exchangeYouTubeCode, refreshYouTubeToken } from "../src/lib/integrations/youtube/oauth";
import { exchangeTikTokCode } from "../src/lib/integrations/tiktok/oauth";
import { fetchInstagramStats } from "../src/lib/integrations/instagram/client";
import { exchangeInstagramCode, instagramAuthorizationUrl, instagramScope, refreshInstagramToken } from "../src/lib/integrations/instagram/oauth";

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

test("Instagram Login authorization requests only business basic", () => {
  process.env.INSTAGRAM_CLIENT_ID = "instagram-client"; process.env.INSTAGRAM_CLIENT_SECRET = "instagram-secret"; process.env.NEXT_PUBLIC_APP_URL = "https://lifeos-navy-six.vercel.app";
  const url = instagramAuthorizationUrl("safe-state");
  assert.equal(url.origin, "https://www.instagram.com");
  assert.equal(url.pathname, "/oauth/authorize");
  assert.equal(url.searchParams.get("scope"), instagramScope);
  assert.equal(url.searchParams.get("scope"), "instagram_business_basic");
  assert.equal(url.searchParams.get("enable_fb_login"), "0");
  assert.equal(url.searchParams.get("state"), "safe-state");
});

test("Instagram code exchange stores a parsed long-lived token", async () => {
  process.env.INSTAGRAM_CLIENT_ID = "instagram-client"; process.env.INSTAGRAM_CLIENT_SECRET = "instagram-secret"; process.env.NEXT_PUBLIC_APP_URL = "https://lifeos-navy-six.vercel.app";
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(input), init });
    return requests.length === 1 ? new Response(JSON.stringify({ access_token: "short-token", user_id: 123 }), { status: 200, headers: { "Content-Type": "application/json" } }) : new Response(JSON.stringify({ access_token: "long-token", token_type: "bearer", expires_in: 5_184_000 }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  const tokens = await exchangeInstagramCode("auth-code", fetcher);
  assert.equal(tokens.accessToken, "long-token");
  assert.equal(tokens.refreshToken, "long-token");
  assert.equal(tokens.scope, "instagram_business_basic");
  assert.ok(tokens.accessTokenExpiresAt);
  assert.match(String(requests[0].init?.body), /grant_type=authorization_code/);
  assert.match(requests[1].url, /grant_type=ig_exchange_token/);
  assert.doesNotMatch(requests[1].url, /client_id/);
});

test("Instagram profile fields normalize followers and media counts", async () => {
  let requested = "";
  const fetcher = (async (input: string | URL | Request) => { requested = String(input); return new Response(JSON.stringify({ id: "ig-1", username: "bright", name: "Bright", profile_picture_url: "https://example.com/ig.jpg", followers_count: 2692, media_count: 48 }), { status: 200, headers: { "Content-Type": "application/json" } }); }) as typeof fetch;
  const stats = await fetchInstagramStats("token", fetcher);
  assert.match(requested, /followers_count/); assert.match(requested, /media_count/);
  assert.deepEqual(stats, { provider: "instagram", providerUserId: "ig-1", displayName: "Bright", username: "bright", avatarUrl: "https://example.com/ig.jpg", followers: 2692, following: null, likes: null, videos: 48 });
});

test("Instagram long-lived token refresh parses its replacement token", async () => {
  const tokens = await refreshInstagramToken("old-token", jsonFetch({ access_token: "new-token", token_type: "bearer", expires_in: 5_184_000 }));
  assert.equal(tokens.accessToken, "new-token");
  assert.equal(tokens.refreshToken, "new-token");
  assert.ok(tokens.accessTokenExpiresAt);
});
