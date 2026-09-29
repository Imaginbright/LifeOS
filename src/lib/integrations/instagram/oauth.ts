import "server-only";

import { appUrl } from "@/lib/env";
import { ProviderError, errorFromResponse } from "@/lib/integrations/errors";
import type { Fetcher, ProviderTokens } from "@/lib/integrations/types";

const authorizationUrl = "https://www.instagram.com/oauth/authorize";
const shortTokenUrl = "https://api.instagram.com/oauth/access_token";
const longTokenUrl = "https://graph.instagram.com/access_token";
const refreshTokenUrl = "https://graph.instagram.com/refresh_access_token";
export const instagramScope = "instagram_business_basic";

const credentials = () => {
  const clientId = process.env.INSTAGRAM_CLIENT_ID, clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new ProviderError("provider_unavailable", "Instagram is not configured.");
  return { clientId, clientSecret };
};

export const instagramRedirectUri = () => `${appUrl()}/api/integrations/instagram/callback`;

export function instagramAuthorizationUrl(state: string) {
  const { clientId } = credentials();
  const url = new URL(authorizationUrl);
  url.search = new URLSearchParams({ client_id: clientId, redirect_uri: instagramRedirectUri(), response_type: "code", scope: instagramScope, state, enable_fb_login: "0", force_reauth: "true" }).toString();
  return url;
}

function longLivedTokens(body: Record<string, unknown>): ProviderTokens {
  if (typeof body.access_token !== "string") throw new ProviderError("malformed_provider_response");
  const expiresAt = typeof body.expires_in === "number" ? new Date(Date.now() + body.expires_in * 1000).toISOString() : null;
  return { accessToken: body.access_token, refreshToken: body.access_token, accessTokenExpiresAt: expiresAt, refreshTokenExpiresAt: expiresAt, tokenType: typeof body.token_type === "string" ? body.token_type : "Bearer", scope: instagramScope };
}

export async function exchangeInstagramCode(code: string, fetcher: Fetcher = fetch) {
  const { clientId, clientSecret } = credentials();
  const shortResponse = await fetcher(shortTokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", redirect_uri: instagramRedirectUri(), code }) });
  if (!shortResponse.ok) throw errorFromResponse(shortResponse.status);
  const shortBody = await shortResponse.json() as Record<string, unknown>;
  if (typeof shortBody.access_token !== "string") throw new ProviderError("malformed_provider_response");
  const url = new URL(longTokenUrl); url.search = new URLSearchParams({ grant_type: "ig_exchange_token", client_secret: clientSecret, access_token: shortBody.access_token }).toString();
  const longResponse = await fetcher(url);
  if (!longResponse.ok) throw errorFromResponse(longResponse.status);
  return longLivedTokens(await longResponse.json() as Record<string, unknown>);
}

export async function refreshInstagramToken(accessToken: string, fetcher: Fetcher = fetch) {
  const url = new URL(refreshTokenUrl); url.search = new URLSearchParams({ grant_type: "ig_refresh_token", access_token: accessToken }).toString();
  const response = await fetcher(url);
  if (!response.ok) throw new ProviderError("token_refresh_failed");
  return longLivedTokens(await response.json() as Record<string, unknown>);
}

export async function revokeInstagramToken(accessToken: string, fetcher: Fetcher = fetch) {
  await fetcher("https://graph.instagram.com/me/permissions", { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => undefined);
}
