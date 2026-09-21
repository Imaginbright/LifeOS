import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import type { SocialAccount } from "@/lib/types";
import { number } from "@/lib/utils";
export function SocialMetricCard({ account }: { account: SocialAccount }) {
  const positive = account.change >= 0;
  return (
    <Link href="/creator" className="card social-card">
      <div className="social-card-top">
        <span>
          <PlatformIcon platform={account.platform} />
          {account.displayName}
        </span>
        <ArrowUpRight className="card-arrow" size={17} />
      </div>
      <div className="social-value">{number(account.followers)}</div>
      <div className="social-label">{account.metricLabel}</div>
      <div className="social-bottom">
        <span className={positive ? "change positive" : "change negative"}>
          {positive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
          {positive ? "+" : "−"}
          {number(Math.abs(account.change))}
          <span>this week</span>
        </span>
        <svg
          className={positive ? "sparkline" : "sparkline negative"}
          viewBox="0 0 100 32"
          aria-hidden="true"
        >
          <path
            d={
              account.platform === "tiktok"
                ? "M1 29 L10 23 L19 25 L28 16 L37 19 L46 15 L55 18 L64 8 L73 10 L82 5 L90 8 L99 1"
                : positive
                  ? "M1 29 L12 29 L22 22 L31 23 L42 18 L51 20 L62 11 L72 14 L83 7 L91 9 L99 2"
                  : "M1 9 L10 13 L19 10 L28 18 L38 15 L47 21 L58 16 L67 22 L77 19 L86 26 L99 25"
            }
          />
        </svg>
      </div>
    </Link>
  );
}
