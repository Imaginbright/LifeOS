"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/primitives";
import { SocialMetricCard } from "@/components/dashboard/social-metric-card";
import { useApp } from "@/components/shared/app-provider";
import { AudienceChart } from "./audience-chart";
import { periodComparison } from "@/lib/social-history";

const periods = { "7D": 7, "30D": 30, "3M": 90, "6M": 180, "1Y": 365 } as const;

export function CreatorPage() {
  const { socialAccounts, socialSnapshots } = useApp();
  const [period, setPeriod] = useState<keyof typeof periods>("30D");
  return (
    <>
      <PageHeader
        eyebrow="creative corner"
        title="A growing community."
        description="A little perspective on the people you reach."
      />
      <div className="social-grid">
        {socialAccounts.map((account) => (
          <SocialMetricCard
            key={account.id}
            account={account}
            comparison={periodComparison(
              socialSnapshots.filter(
                (item) => item.platform === account.platform,
              ),
              periods[period],
              period,
              new Date(),
            )}
          />
        ))}
      </div>
      <AudienceChart
        accounts={socialAccounts}
        snapshots={socialSnapshots}
        period={period}
        setPeriod={setPeriod}
      />
      <p className="data-note">
        Audience history is recorded when a connected account synchronizes.
      </p>
    </>
  );
}
