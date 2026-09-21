import { test } from "node:test";
import assert from "node:assert/strict";
import {
  monthlyEquivalent,
  nextRenewals,
  subscriptionTotals,
} from "../src/lib/subscription-utils";
import type { Subscription } from "../src/lib/types";
const base: Subscription = {
  id: "test",
  name: "Test plan",
  amount: 12000,
  currency: "NGN",
  billingCycle: "monthly",
  renewalDate: "2026-09-24",
  category: "Productivity",
  active: true,
};
test("billing cycles normalize correctly, including explicit custom intervals", () => {
  assert.equal(monthlyEquivalent(base), 12000);
  assert.equal(monthlyEquivalent({ ...base, billingCycle: "yearly" }), 1000);
  assert.equal(
    monthlyEquivalent({ ...base, amount: 120, billingCycle: "weekly" }),
    520,
  );
  assert.equal(
    monthlyEquivalent({
      ...base,
      amount: 120,
      billingCycle: "custom",
      customIntervalDays: 365,
    }),
    10,
  );
  assert.equal(monthlyEquivalent({ ...base, billingCycle: "custom" }), 0);
  assert.equal(monthlyEquivalent({ ...base, active: false }), 0);
});
test("totals never combine different currencies or inactive subscriptions", () => {
  const items = [
    base,
    { ...base, id: "usd", amount: 20, currency: "USD" as const },
    { ...base, id: "inactive", active: false },
  ];
  assert.deepEqual(subscriptionTotals(items, "NGN"), {
    monthly: 12000,
    yearly: 144000,
    count: 1,
  });
  assert.deepEqual(subscriptionTotals(items, "USD"), {
    monthly: 20,
    yearly: 240,
    count: 1,
  });
  assert.deepEqual(subscriptionTotals(items, "EUR"), {
    monthly: 0,
    yearly: 0,
    count: 0,
  });
});
test("renewal sorting includes today, ignores past and inactive plans, and preserves input order", () => {
  const items = [
    base,
    { ...base, id: "today", renewalDate: "2026-09-20" },
    { ...base, id: "past", renewalDate: "2026-09-19" },
    { ...base, id: "inactive", active: false },
  ];
  assert.deepEqual(
    nextRenewals(items, "2026-09-20").map((item) => item.id),
    ["today", "test"],
  );
  assert.equal(items[0].id, "test");
});
