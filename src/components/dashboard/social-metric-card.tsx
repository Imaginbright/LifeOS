import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import type { SocialAccount } from "@/lib/types";
import { number } from "@/lib/utils";
export function SocialMetricCard({ account }: { account: SocialAccount }) {
  const positive = account.change >= 0;
  const connected = account.status === "connected";
  const values = account.trend ?? [];
  const sparkline = values.length > 1 ? values.map((value, index) => {
    const min = Math.min(...values), max = Math.max(...values), range = max - min || 1;
    const x = 1 + (index / (values.length - 1)) * 98;
    const y = 29 - ((value - min) / range) * 27;
    return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ") : "";
  return (
    <Link href={connected ? "/creator" : "/settings"} className="card social-card">
      <div className="social-card-top">
        <span>
          <PlatformIcon platform={account.platform} />
          {account.displayName}
        </span>
        <ArrowUpRight className="card-arrow" size={17} />
      </div>
      <div className="social-value">{connected ? account.dataAvailable ? number(account.followers) : "Unavailable" : account.status === "needs_setup" ? "Needs setup" : "Not connected"}</div>
      <div className="social-label">{connected ? account.metricLabel : account.message ?? "Connect →"}</div>
      <div className="social-bottom">
        {connected && account.comparisonAvailable ? <span className={positive ? "change positive" : "change negative"}>
          {positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
          {positive ? "+" : "−"}
          {number(Math.abs(account.change))}
          <span>this week</span>
        </span> : <span className="change">{connected ? "No comparison yet" : "Connect →"}</span>}
        {connected && account.comparisonAvailable && sparkline && <svg
          className={positive ? "sparkline" : "sparkline negative"}
          viewBox="0 0 100 32"
          aria-hidden="true"
        >
          <path d={sparkline} />
        </svg>}
      </div>
    </Link>
  );
}
