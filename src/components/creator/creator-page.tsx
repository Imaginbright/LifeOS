"use client";

import { PageHeader } from "@/components/shared/primitives";
import { SocialMetricCard } from "@/components/dashboard/social-metric-card";
import { useApp } from "@/components/shared/app-provider";
import { AudienceChart } from "./audience-chart";

export function CreatorPage() {
  const { socialAccounts, socialSnapshots } = useApp();
  return (
    <>
      <PageHeader eyebrow="Your creative corner" title="A growing community." description="A little perspective on the people you reach." />
      <div className="social-grid">{socialAccounts.map((account) => <SocialMetricCard key={account.id} account={account} />)}</div>
      <AudienceChart accounts={socialAccounts} snapshots={socialSnapshots} />
      <p className="data-note">Audience history is recorded when a connected account synchronizes.</p>
    </>
  );
}
