import type { Currency, Subscription } from "./types";
import { addDays, addMonths, addWeeks, addYears, format, isBefore, parseISO } from "date-fns";
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
    .filter((item) => item.active)
    .map((item) => ({ ...item, renewalDate: effectiveRenewalDate(item, today) }))
    .sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));
}

export function effectiveRenewalDate(subscription: Subscription, today: string) {
  const original = parseISO(subscription.renewalDate);
  let renewal = original;
  const current = parseISO(today);
  if (!isBefore(renewal, current)) return subscription.renewalDate;
  let periods = 0;
  const advance = () => {
    periods += 1;
    switch (subscription.billingCycle) {
      case "weekly": renewal = addWeeks(original, periods); break;
      case "monthly": renewal = addMonths(original, periods); break;
      case "yearly": renewal = addYears(original, periods); break;
      case "custom": renewal = addDays(original, periods * (subscription.customIntervalDays || 1)); break;
    }
  };
  while (isBefore(renewal, current)) advance();
  return format(renewal, "yyyy-MM-dd");
}
