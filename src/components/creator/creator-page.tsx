import { PageHeader } from "@/components/shared/primitives";
import { SocialMetricCard } from "@/components/dashboard/social-metric-card";
import { socialAccounts } from "@/lib/mock-data";
import { AudienceChart } from "./audience-chart";
export function CreatorPage() {
  return (
    <>
      <PageHeader
        eyebrow="Your creative corner"
        title="A growing community."
        description="A little perspective on the people you reach."
      />
      <div className="social-grid">
        {socialAccounts.map((account) => (
          <SocialMetricCard key={account.id} account={account} />
        ))}
      </div>
      <AudienceChart />
      <p className="data-note">
        Sample audience data. Account connections will have a home in Settings.
      </p>
    </>
  );
}
