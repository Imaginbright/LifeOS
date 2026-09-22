export type SocialProviderName = "youtube" | "tiktok" | "instagram";

export type NormalizedSocialStats = {
  provider: SocialProviderName;
  providerUserId: string;
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  followers: number | null;
  following: number | null;
  likes: number | null;
  videos: number | null;
};

export type ProviderTokens = {
  accessToken: string;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  tokenType: string | null;
  scope: string | null;
};

export type Fetcher = typeof fetch;

