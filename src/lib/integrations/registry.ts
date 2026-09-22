import type { SocialProviderName } from "./types";

export const providerDetails: Record<SocialProviderName, { label: string; available: boolean }> = {
  youtube: { label: "YouTube", available: true },
  tiktok: { label: "TikTok", available: true },
  instagram: { label: "Instagram", available: false },
};
