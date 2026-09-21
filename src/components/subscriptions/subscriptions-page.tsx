"use client";
import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Grid2X2, List, ArrowUpRight } from "lucide-react";
import { useApp } from "@/components/shared/app-provider";
import {
  AddButton,
  EmptyState,
  PageHeader,
} from "@/components/shared/primitives";
import { subscriptionTotals, nextRenewals } from "@/lib/subscription-utils";
import { DEMO_TODAY } from "@/lib/mock-data";
import { money, shortDate } from "@/lib/utils";
import type { Currency } from "@/lib/types";
import { SubscriptionGrid, SubscriptionList } from "./subscription-views";
export function SubscriptionsPage() {
  const { subscriptions, setAddKind, preferences } = useApp();
  const [currency, setCurrency] = useState<Currency>(preferences.currency);
  const filtered = subscriptions.filter(
    (item) => item.active && item.currency === currency,
  );
  const totals = subscriptionTotals(subscriptions, currency);
  const next = nextRenewals(filtered, DEMO_TODAY)[0];
  return (
    <>
      <PageHeader
        eyebrow="The things you make room for"
        title="Your subscriptions."
        description="A clear picture of the little recurring things."
        action={
          <AddButton onClick={() => setAddKind("subscription")}>
            Add subscription
          </AddButton>
        }
      />
      <div className="subscription-stats">
        <div className="monthly-stat">
          <p className="eyebrow">Monthly cost</p>
          <strong>{money(totals.monthly, currency)}</strong>
          <span>Across {totals.count} active subscriptions</span>
          <ArrowUpRight size={24} />
        </div>
        <div>
          <p className="eyebrow">Yearly projection</p>
          <strong>{money(totals.yearly, currency)}</strong>
          <span>At your current pace</span>
        </div>
        <div>
          <p className="eyebrow">Active</p>
          <strong>{totals.count.toString().padStart(2, "0")}</strong>
          <span>A little part of your everyday</span>
        </div>
        <div>
          <p className="eyebrow">Next renewal</p>
          <strong>{next ? shortDate(next.renewalDate) : "—"}</strong>
          <span>{next?.name ?? "Nothing coming up"}</span>
        </div>
      </div>
      <Tabs.Root defaultValue="grid">
        <div className="subscriptions-toolbar">
          <div>
            <h2>Your everyday essentials</h2>
            <p>Everything in its own little place.</p>
          </div>
          <div className="view-controls">
            <label className="sr-only" htmlFor="currency-filter">
              Subscription currency
            </label>
            <select
              id="currency-filter"
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Currency)}
            >
              {["NGN", "USD", "GBP", "EUR"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <Tabs.List
              className="tabs small-tabs"
              aria-label="Subscription display"
            >
              <Tabs.Trigger value="grid">
                <Grid2X2 size={15} />
                Grid
              </Tabs.Trigger>
              <Tabs.Trigger value="list">
                <List size={16} />
                List
              </Tabs.Trigger>
            </Tabs.List>
          </div>
        </div>
        {filtered.length ? (
          <>
            <Tabs.Content value="grid">
              <SubscriptionGrid subscriptions={filtered} />
            </Tabs.Content>
            <Tabs.Content value="list">
              <div className="card">
                <SubscriptionList subscriptions={filtered} />
              </div>
            </Tabs.Content>
          </>
        ) : (
          <div className="card">
            <EmptyState
              title="No subscriptions yet"
              description="Add your subscriptions to keep track of what renews next."
              action={
                <AddButton onClick={() => setAddKind("subscription")}>
                  Add subscription
                </AddButton>
              }
            />
          </div>
        )}
      </Tabs.Root>
      <div className="subscription-note">
        <span>
          Amounts are entered manually. Totals are shown in {currency} only.
        </span>
        <span>Weekly & custom plans are averaged over a year.</span>
      </div>
    </>
  );
}
