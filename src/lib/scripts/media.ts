import type { ScriptType } from "@/lib/types";

export const scriptMedia: Array<{ type: ScriptType; title: string; slug: string; description: string }> = [
  { type: "longform", title: "YouTube", slug: "youtube", description: "Reviews, comparisons, explainers and deeper stories." },
  { type: "shorts", title: "Shorts", slug: "shorts", description: "Short-form videos for TikTok, Reels and YouTube Shorts." },
  { type: "blog", title: "Blog", slug: "blog", description: "Articles, reviews, guides and written stories." },
];

export function scriptMediaForType(type: ScriptType) {
  return scriptMedia.find((medium) => medium.type === type)!;
}

export function scriptTypeForSlug(slug: string): ScriptType | null {
  return scriptMedia.find((medium) => medium.slug === slug)?.type ?? null;
}
