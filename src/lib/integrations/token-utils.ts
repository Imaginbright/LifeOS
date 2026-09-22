export function shouldRefreshToken(expiresAt: string | null, now = Date.now(), windowMs = 5 * 60_000) {
  return Boolean(expiresAt && new Date(expiresAt).getTime() <= now + windowMs);
}

