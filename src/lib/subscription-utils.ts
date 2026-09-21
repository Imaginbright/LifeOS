import type { Currency, Subscription } from "./types";
export function monthlyEquivalent(subscription: Subscription): number {
  if (!subscription.active) return 0;
  switch (subscription.billingCycle) {
    case "monthly":
      return subscription.amount;
    case "yearly":
      return subscription.amount / 12;
    case "weekly":
      return (subscription.amount * 52) / 12;
    case "custom":
      return subscription.customIntervalDays &&
        subscription.customIntervalDays > 0
        ? (subscription.amount * 365) / (12 * subscription.customIntervalDays)
        : 0;
  }
}
export function subscriptionTotals(items: Subscription[], currency: Currency) {
  const active = items.filter(
    (item) => item.active && item.currency === currency,
  );
  const monthly = active.reduce(
    (sum, item) => sum + monthlyEquivalent(item),
    0,
  );
  return { monthly, yearly: monthly * 12, count: active.length };
}
export function nextRenewals(items: Subscription[], today: string) {
  return items
    .filter((item) => item.active && item.renewalDate >= today)
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));
}
