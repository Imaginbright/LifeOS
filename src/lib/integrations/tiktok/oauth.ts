import "server-only";

import { appUrl } from "@/lib/env";
import { ProviderError, errorFromResponse } from "@/lib/integrations/errors";
import type { Fetcher, ProviderTokens } from "@/lib/integrations/types";

const tokenUrl = "https://open.tiktokapis.com/v2/oauth/token/";
const credentials = () => {
  const clientKey = process.env.TIKTOK_CLIENT_KEY, clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) throw new ProviderError("provider_unavailable", "TikTok is not configured.");
  return { clientKey, clientSecret };
};
export const tiktokRedirectUri = () => `${appUrl()}/api/integrations/tiktok/callback`;
export const canConnectTikTok = () => tiktokRedirectUri().startsWith("https://");

export function tiktokAuthorizationUrl(state: string) {
  if (!canConnectTikTok()) throw new ProviderError("provider_unavailable", "Connect TikTok from the deployed LifeOS app.");
  const { clientKey } = credentials();
  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.search = new URLSearchParams({ client_key: clientKey, response_type: "code", scope: "user.info.basic,user.info.stats", redirect_uri: tiktokRedirectUri(), state }).toString();
  return url;
}

function normalizeTokens(body: Record<string, unknown>): ProviderTokens {
  if (typeof body.access_token !== "string") throw new ProviderError("malformed_provider_response");
  return { accessToken: body.access_token, refreshToken: typeof body.refresh_token === "string" ? body.refresh_token : null, accessTokenExpiresAt: typeof body.expires_in === "number" ? new Date(Date.now() + body.expires_in * 1000).toISOString() : null, refreshTokenExpiresAt: typeof body.refresh_expires_in === "number" ? new Date(Date.now() + body.refresh_expires_in * 1000).toISOString() : null, tokenType: typeof body.token_type === "string" ? body.token_type : "Bearer", scope: typeof body.scope === "string" ? body.scope : null };
}

export async function exchangeTikTokCode(code: string, fetcher: Fetcher = fetch) {
  const { clientKey, clientSecret } = credentials();
  const response = await fetcher(tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_key: clientKey, client_secret: clientSecret, code, grant_type: "authorization_code", redirect_uri: tiktokRedirectUri() }) });
  if (!response.ok) throw errorFromResponse(response.status); return normalizeTokens(await response.json() as Record<string, unknown>);
}

export async function refreshTikTokToken(refreshToken: string, fetcher: Fetcher = fetch) {
  const { clientKey, clientSecret } = credentials();
  const response = await fetcher(tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_key: clientKey, client_secret: clientSecret, grant_type: "refresh_token", refresh_token: refreshToken }) });
  if (!response.ok) throw new ProviderError("token_refresh_failed"); return normalizeTokens(await response.json() as Record<string, unknown>);
}

export async function revokeTikTokToken(token: string, fetcher: Fetcher = fetch) {
  const { clientKey, clientSecret } = credentials();
  await fetcher("https://open.tiktokapis.com/v2/oauth/revoke/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_key: clientKey, client_secret: clientSecret, token }) }).catch(() => undefined);
}

