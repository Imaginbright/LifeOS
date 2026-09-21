export function CardSkeleton({
  kind = "metric",
}: {
  kind?: "metric" | "subscription" | "chart" | "inbox";
}) {
  return (
    <div
      className={`card skeleton-card skeleton-${kind}`}
      role="status"
      aria-label={`Loading ${kind}`}
    >
      <span className="skeleton" />
      <span className="skeleton" />
      <span className="skeleton" />
    </div>
  );
}
export function DashboardSkeleton() {
  return (
    <div className="loading-page">
      <span className="skeleton loading-title" />
      <div className="social-grid">
        {[0, 1, 2].map((key) => (
          <CardSkeleton key={key} />
        ))}
      </div>
      <div className="dashboard-grid">
        <CardSkeleton kind="chart" />
        <CardSkeleton kind="inbox" />
        <CardSkeleton kind="subscription" />
      </div>
    </div>
  );
}
