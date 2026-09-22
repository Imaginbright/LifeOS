export function dedupeInboxEvents<T extends { source_key: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.source_key, item])).values()];
}

export const renewalEventKey = (subscriptionId: string, renewalDate: string) => `lifeos:subscription-renewal:${subscriptionId}:${renewalDate}`;
export const goalDeadlineEventKey = (goalId: string, deadline: string) => `lifeos:goal-deadline:${goalId}:${deadline}`;

