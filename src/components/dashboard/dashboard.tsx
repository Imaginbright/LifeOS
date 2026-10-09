"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useApp } from "@/components/shared/app-provider";
import {
  AddButton,
  EmptyState,
  PageHeader,
  SectionTitle,
} from "@/components/shared/primitives";
import { todayDate } from "@/lib/date";
import { format } from "date-fns";
import { money, shortDate } from "@/lib/utils";
import { nextRenewals, subscriptionTotals } from "@/lib/subscription-utils";
import { SocialMetricCard } from "./social-metric-card";
import { TaskList, TaskProgress } from "@/components/tasks/task-list";
import { GoalCard } from "@/components/goals/goal-card";
import { SubscriptionGrid } from "@/components/subscriptions/subscription-views";
import { InboxItem } from "@/components/inbox/inbox-item";
export function Dashboard() {
  const {
    tasks,
    goals,
    subscriptions,
    inbox,
    socialAccounts,
    setAddKind,
    preferences,
  } = useApp();
  const today = todayDate();
  const todayTasks = tasks.filter(
    (task) =>
      task.scope === "daily" &&
      (task.date === today || (task.date < today && !task.completed)),
  );
  const totals = subscriptionTotals(subscriptions, preferences.currency);
  const next = nextRenewals(subscriptions, today)[0];
  const previews = nextRenewals(subscriptions, today)
    .filter((item) => item.active && item.currency === preferences.currency)
    .slice(0, 3);
  return (
    <>
      <PageHeader
        eyebrow={format(new Date(), "EEEE, MMMM d, yyyy")}
        title={`Good morning, ${preferences.name}.`}
        action={
          <AddButton onClick={() => setAddKind("task")}>Add task</AddButton>
        }
      />
      <div className="dashboard-section-label">
        <span className="eyebrow">Your audience</span>
        <Link href="/creator">
          Creator <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="social-grid">
        {socialAccounts.map((account) => (
          <SocialMetricCard
            key={account.id}
            account={account}
            href="/creator"
          />
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="card today-card">
          <SectionTitle title="Today's tasks" href="/tasks" />
          <TaskProgress tasks={todayTasks} />
          <TaskList tasks={todayTasks.slice(0, 5)} />
        </section>
        <section className="card goals-preview-card">
          <SectionTitle
            title="Goals"
            href="/goals"
            label="All goals"
          />
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
            title="Inbox"
            href="/inbox"
            label="Open inbox"
          />
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
