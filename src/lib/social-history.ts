import type { SocialSnapshot } from "@/lib/types";

export type FollowerComparison = { change: number; label: string } | null;

export function sortedHistory<T extends { date: string; id?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.date.localeCompare(b.date) || (a.id ?? "").localeCompare(b.id ?? ""));
}

export function previousSyncComparison(history: SocialSnapshot[]): FollowerComparison {
  const ordered = sortedHistory(history);
  if (ordered.length < 2) return null;
  return { change: ordered.at(-1)!.followers - ordered.at(-2)!.followers, label: "since last sync" };
}

export function periodComparison(history: SocialSnapshot[], days: number, period: string, now: Date): FollowerComparison {
  const ordered = sortedHistory(history);
  if (ordered.length < 2) return null;
  const target = now.getTime() - days * 86_400_000;
  const latestIsRecent = new Date(ordered.at(-1)!.date).getTime() >= target;
  const baseline = latestIsRecent ? [...ordered.slice(0, -1)].reverse().find((item) => new Date(item.date).getTime() <= target) : undefined;
  const chosen = baseline ?? ordered[0];
  const boundaryTolerance = Math.min(7, Math.max(1, Math.floor(days / 10))) * 86_400_000;
  const fullPeriod = baseline && target - new Date(baseline.date).getTime() <= boundaryTolerance;
  const label = fullPeriod ? `in ${period}` : `since ${new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(chosen.date))}`;
  return { change: ordered.at(-1)!.followers - chosen.followers, label };
}
