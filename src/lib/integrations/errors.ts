export type ProviderErrorCode = "authorization_denied" | "missing_scope" | "token_expired" | "token_refresh_failed" | "provider_rate_limited" | "provider_unavailable" | "malformed_provider_response" | "unknown_provider_error";

const safeMessages: Record<ProviderErrorCode, string> = {
  authorization_denied: "Authorization was cancelled or denied.", missing_scope: "The required permission was not granted.", token_expired: "The connection has expired. Please reconnect.", token_refresh_failed: "The connection could not be refreshed. Please reconnect.", provider_rate_limited: "The provider is temporarily limiting requests. Try again later.", provider_unavailable: "The provider is temporarily unavailable.", malformed_provider_response: "The provider returned an unexpected response.", unknown_provider_error: "The provider could not be synchronized.",
};

export class ProviderError extends Error {
  constructor(public readonly code: ProviderErrorCode, message = safeMessages[code]) { super(message); this.name = "ProviderError"; }
}

export function safeProviderError(error: unknown) {
  return error instanceof ProviderError ? error : new ProviderError("unknown_provider_error");
}

export function errorFromResponse(status: number) {
  if (status === 401 || status === 403) return new ProviderError("token_expired");
  if (status === 429) return new ProviderError("provider_rate_limited");
  if (status >= 500) return new ProviderError("provider_unavailable");
  return new ProviderError("unknown_provider_error");
}

