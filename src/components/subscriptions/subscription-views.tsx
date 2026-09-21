import {
  Cloud,
  Globe,
  Music2,
  Aperture,
  Triangle,
  CreditCard,
} from "lucide-react";
import { YouTubeMark as Youtube } from "@/components/shared/platform-icon";
import type { Subscription } from "@/lib/types";
import { money, shortDate } from "@/lib/utils";
import { monthlyEquivalent } from "@/lib/subscription-utils";
export function ServiceIcon({ icon }: { icon?: string }) {
  const Icon =
    icon === "spark"
      ? Aperture
      : icon === "adobe"
        ? Triangle
        : icon === "cloud"
          ? Cloud
          : icon === "youtube"
            ? Youtube
            : icon === "music"
              ? Music2
              : icon === "globe"
                ? Globe
                : CreditCard;
  return (
    <span className={`service-icon service-${icon ?? "default"}`}>
      <Icon size={23} strokeWidth={1.7} />
    </span>
  );
}
export function SubscriptionTile({
  subscription,
  large = false,
}: {
  subscription: Subscription;
  large?: boolean;
}) {
  return (
    <article
      className={`subscription-tile tint-${subscription.icon ?? "default"} ${large ? "large-tile" : ""}`}
    >
      <div className="tile-top">
        <ServiceIcon icon={subscription.icon} />
        <span className="tile-cycle">
          {subscription.billingCycle === "custom"
            ? `Every ${subscription.customIntervalDays} days`
            : subscription.billingCycle}
        </span>
      </div>
      <div className="tile-info">
        <h3>{subscription.name}</h3>
        <strong>{money(subscription.amount, subscription.currency)}</strong>
        <p>Renews {shortDate(subscription.renewalDate)}</p>
      </div>
    </article>
  );
}
export function SubscriptionGrid({
  subscriptions,
  compact = false,
}: {
  subscriptions: Subscription[];
  compact?: boolean;
}) {
  const sorted = [...subscriptions].sort(
    (a, b) =>
      a.currency.localeCompare(b.currency) ||
      monthlyEquivalent(b) - monthlyEquivalent(a),
  );
  return (
    <div className={`subscription-grid ${compact ? "compact" : ""}`}>
      {sorted.map((item, index) => (
        <SubscriptionTile
          key={item.id}
          subscription={item}
          large={index === 0}
        />
      ))}
    </div>
  );
}
export function SubscriptionList({
  subscriptions,
}: {
  subscriptions: Subscription[];
}) {
  return (
    <div className="subscription-table">
      <div className="subscription-table-header">
        <span>Service</span>
        <span>Amount</span>
        <span>Billing cycle</span>
        <span>Renewal date</span>
        <span>Category</span>
      </div>
      {subscriptions.map((item) => (
        <article className="subscription-table-row" key={item.id}>
          <div>
            <ServiceIcon icon={item.icon} />
            <strong>{item.name}</strong>
          </div>
          <span className="table-amount">
            {money(item.amount, item.currency)}
          </span>
          <span className="capitalize">
            {item.billingCycle === "custom"
              ? `Every ${item.customIntervalDays} days`
              : item.billingCycle}
          </span>
          <span>Renews {shortDate(item.renewalDate)}</span>
          <span className="table-category">{item.category}</span>
        </article>
      ))}
    </div>
  );
}
