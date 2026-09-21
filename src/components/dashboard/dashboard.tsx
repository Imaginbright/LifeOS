"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sun } from "lucide-react";
import { useApp } from "@/components/shared/app-provider";
import {
  AddButton,
  EmptyState,
  PageHeader,
  SectionTitle,
} from "@/components/shared/primitives";
import { socialAccounts, DEMO_TODAY } from "@/lib/mock-data";
import { money, shortDate } from "@/lib/utils";
import { nextRenewals, subscriptionTotals } from "@/lib/subscription-utils";
import { SocialMetricCard } from "./social-metric-card";
import { TaskList, TaskProgress } from "@/components/tasks/task-list";
import { GoalCard } from "@/components/goals/goal-card";
import { SubscriptionGrid } from "@/components/subscriptions/subscription-views";
import { InboxItem } from "@/components/inbox/inbox-item";
export function Dashboard() {
  const { tasks, goals, subscriptions, inbox, setAddKind, preferences } =
    useApp();
  const todayTasks = tasks.filter(
    (task) => task.date === DEMO_TODAY && task.scope === "daily",
  );
  const totals = subscriptionTotals(subscriptions, preferences.currency);
  const next = nextRenewals(subscriptions, DEMO_TODAY)[0];
  const previews = subscriptions
    .filter((item) => item.active && item.currency === preferences.currency)
    .slice(0, 3);
  return (
    <>
      <PageHeader
        eyebrow="Sunday, September 20, 2026"
        title={`Good morning, ${preferences.name}.`}
        action={
          <AddButton onClick={() => setAddKind("task")}>Add task</AddButton>
        }
      />
      <div className="dashboard-section-label">
        <span className="eyebrow">Your audience</span>
        <Link href="/creator">
          A little growth, every day <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="social-grid">
        {socialAccounts.map((account) => (
          <SocialMetricCard key={account.id} account={account} />
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="card today-card">
          <SectionTitle title="Today's tasks" href="/tasks" />
          <TaskProgress tasks={todayTasks} />
          <TaskList tasks={todayTasks.slice(0, 5)} />
          <div className="card-footnote">
            <span className="tiny-sun">
              <Sun size={15} />
            </span>
            {todayTasks.filter((task) => !task.completed).length === 0
              ? "All done. Make a little time for yourself."
              : "One thing at a time. You’re making progress."}
            <Link href="/tasks" aria-label="View all today's tasks">
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section className="card goals-preview-card">
          <SectionTitle
            title="A little closer"
            href="/goals"
            label="All goals"
          />
          <p className="section-subtitle">Big things, small steps.</p>
          {goals.length ? (
            goals
              .slice(0, 2)
              .map((goal) => <GoalCard goal={goal} key={goal.id} compact />)
          ) : (
            <EmptyState
              title="No goals yet."
              action={
                <AddButton onClick={() => setAddKind("goal")}>
                  Add goal
                </AddButton>
              }
            />
          )}
        </section>
        <section className="card subscriptions-preview-card">
          <SectionTitle
            title="Your subscriptions"
            href="/subscriptions"
            label="Manage"
          />
          <div className="subscription-summary">
            <div>
              <span className="eyebrow">
                Monthly total · {preferences.currency}
              </span>
              <strong>
                {money(totals.monthly, preferences.currency)}
                <small>/ mo</small>
              </strong>
            </div>
            <div>
              <span className="muted">Yearly projection</span>
              <span className="yearly-number">
                {money(totals.yearly, preferences.currency)}
              </span>
            </div>
          </div>
          {previews.length ? (
            <SubscriptionGrid subscriptions={previews} compact />
          ) : (
            <EmptyState
              title="No subscriptions in this currency."
              action={
                <AddButton onClick={() => setAddKind("subscription")}>
                  Add subscription
                </AddButton>
              }
            />
          )}
          <div className="subscription-preview-footer">
            <span>
              {next
                ? `Next up: ${next.name.split(" ").slice(0, 2).join(" ")} · ${shortDate(next.renewalDate)}`
                : "No upcoming renewals"}
            </span>
            <Link href="/subscriptions" aria-label="View subscriptions">
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <section className="card inbox-preview-card">
          <SectionTitle
            title="On your radar"
            href="/inbox"
            label="Open inbox"
          />
          <p className="section-subtitle">A few things worth your attention.</p>
          {inbox.length ? (
            inbox
              .slice(0, 3)
              .map((item) => <InboxItem key={item.id} item={item} compact />)
          ) : (
            <EmptyState title="You're all caught up." />
          )}
          <div className="inbox-preview-footer">
            <span className="unread-dot" />
            {inbox.filter((item) => !item.read).length} unread notifications
          </div>
        </section>
      </div>
    </>
  );
}
