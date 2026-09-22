import "server-only";

import { appUrl } from "@/lib/env";
import { ProviderError, errorFromResponse } from "@/lib/integrations/errors";
import type { Fetcher, ProviderTokens } from "@/lib/integrations/types";

const tokenUrl = "https://oauth2.googleapis.com/token";
export const youtubeRedirectUri = () => `${appUrl()}/api/integrations/youtube/callback`;

const credentials = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID, clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new ProviderError("provider_unavailable", "YouTube is not configured.");
  return { clientId, clientSecret };
};

export function youtubeAuthorizationUrl(state: string) {
  const { clientId } = credentials();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: clientId, redirect_uri: youtubeRedirectUri(), response_type: "code", scope: "https://www.googleapis.com/auth/youtube.readonly", access_type: "offline", prompt: "consent", include_granted_scopes: "true", state }).toString();
  return url;
}

function normalizeTokens(body: Record<string, unknown>, existingRefresh: string | null = null): ProviderTokens {
  if (typeof body.access_token !== "string") throw new ProviderError("malformed_provider_response");
  return { accessToken: body.access_token, refreshToken: typeof body.refresh_token === "string" ? body.refresh_token : existingRefresh, accessTokenExpiresAt: typeof body.expires_in === "number" ? new Date(Date.now() + body.expires_in * 1000).toISOString() : null, refreshTokenExpiresAt: null, tokenType: typeof body.token_type === "string" ? body.token_type : "Bearer", scope: typeof body.scope === "string" ? body.scope : null };
}

export async function exchangeYouTubeCode(code: string, fetcher: Fetcher = fetch) {
  const { clientId, clientSecret } = credentials();
  const response = await fetcher(tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: youtubeRedirectUri(), grant_type: "authorization_code" }) });
  if (!response.ok) throw errorFromResponse(response.status);
  return normalizeTokens(await response.json() as Record<string, unknown>);
}

export async function refreshYouTubeToken(refreshToken: string, fetcher: Fetcher = fetch) {
  const { clientId, clientSecret } = credentials();
  const response = await fetcher(tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ refresh_token: refreshToken, client_id: clientId, client_secret: clientSecret, grant_type: "refresh_token" }) });
  if (!response.ok) throw new ProviderError("token_refresh_failed");
  return normalizeTokens(await response.json() as Record<string, unknown>, refreshToken);
}

export async function revokeYouTubeToken(token: string, fetcher: Fetcher = fetch) {
  await fetcher("https://oauth2.googleapis.com/revoke", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token }) }).catch(() => undefined);
}

