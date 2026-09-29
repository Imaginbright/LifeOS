import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import type { SocialAccount } from "@/lib/types";
import { number } from "@/lib/utils";
import type { FollowerComparison } from "@/lib/social-history";
export function SocialMetricCard({ account, href, comparison }: { account: SocialAccount; href?: string; comparison?: FollowerComparison }) {
  const shown = comparison === undefined ? account.comparisonAvailable ? { change: account.change, label: "since last sync" } : null : comparison;
  const positive = (shown?.change ?? 0) >= 0;
  const connected = account.status === "connected" || account.status === "token_expired" || account.status === "error";
  const values = account.trend ?? [];
  const sparkline = values.length > 1 ? values.map((value, index) => {
    const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
    const x = 1 + (index / (values.length - 1)) * 98;
    const y = 29 - ((value - min) / range) * 27;
    return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") : "";
  const content = (
    <>
      <div className="social-card-top">
        <span>
          <PlatformIcon platform={account.platform} />
          {account.displayName}
        </span>
        {href && <ArrowUpRight className="card-arrow" size={17} />}
      </div>
      <div className="social-value">{connected ? account.dataAvailable ? number(account.followers) : "Unavailable" : account.status === "needs_setup" ? "Needs setup" : "Not connected"}</div>
      <div className="social-label">{connected ? account.metricLabel : account.message ?? "Connect →"}</div>
      <div className="social-bottom">
        {connected && shown ? <span className={shown.change === 0 ? "change" : positive ? "change positive" : "change negative"}>
          {shown.change === 0 ? "No change" : <>{positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}{number(Math.abs(shown.change))}</>}
          <span>{shown.label}</span>
        </span> : <span className="change">{connected ? "No comparison yet" : "Connect →"}</span>}
        {connected && shown && sparkline && <svg
          className={positive ? "sparkline" : "sparkline negative"}
          viewBox="0 0 100 32"
          aria-hidden="true"
        >
          <path d={sparkline} />
        </svg>}
      </div>
    </>
  );
  return href ? <Link href={href} className="card social-card">{content}</Link> : <article className="card social-card">{content}</article>;
}
