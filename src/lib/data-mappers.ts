import type { Database } from "@/lib/database.types";
import type { AppData, ConnectedAccount, Goal, InboxItem, Platform, Preferences, SocialAccount, SocialSnapshot, Subscription, Task, TaskRecurrence } from "@/lib/types";
import { previousSyncComparison, sortedHistory } from "@/lib/social-history";

type Tables = Database["public"]["Tables"];
type Row<T extends keyof Tables> = Tables[T]["Row"];

const titleCase = (value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

export function mapPreferences(profile: Row<"profiles">, email?: string): Preferences {
  return { appearance: profile.appearance as Preferences["appearance"], currency: profile.currency as Preferences["currency"], startOfWeek: profile.start_of_week as Preferences["startOfWeek"], notifications: profile.notifications, name: profile.display_name || email?.split("@")[0] || "You", email: profile.email ?? email, timezone: profile.timezone };
}

export function mapRecurrence(row: Row<"task_recurrences">): TaskRecurrence {
  return { id: row.id, frequency: row.frequency as TaskRecurrence["frequency"], interval: row.interval_count, weekdays: row.weekdays, dayOfMonth: row.day_of_month, startsOn: row.starts_on, endsOn: row.ends_on, active: row.active };
}

export function mapTask(row: Row<"tasks">, series?: Row<"task_recurrences">[]): Task {
  const recurrence = series?.find((item) => item.id === row.recurrence_id);
  return { id: row.id, title: row.title, notes: row.notes ?? "", date: row.due_date ?? row.period_month ?? row.created_at.slice(0, 10), completed: row.completed, priority: titleCase(row.priority) as Task["priority"], category: row.category as Task["category"], scope: row.scope as Task["scope"], recurrenceId: row.recurrence_id ?? undefined, occurrenceDate: row.occurrence_date ?? undefined, recurrence: recurrence ? mapRecurrence(recurrence) : undefined };
}

export function mapGoal(row: Row<"goals">): Goal {
  return { id: row.id, title: row.title, description: row.description, currentValue: Number(row.current_value), targetValue: Number(row.target_value), unit: row.unit, deadline: row.deadline, category: row.category };
}

export function mapSubscription(row: Row<"subscriptions">): Subscription {
  return { id: row.id, name: row.name, amount: Number(row.amount), currency: row.currency as Subscription["currency"], billingCycle: row.billing_cycle as Subscription["billingCycle"], customIntervalDays: row.custom_interval_days ?? undefined, renewalDate: row.renewal_date, category: row.category, icon: row.icon ?? undefined, active: row.active };
}

export function mapInbox(row: Row<"inbox_items">): InboxItem {
  return { id: row.id, category: row.category as InboxItem["category"], title: row.title, description: row.description, date: row.event_at, read: Boolean(row.read_at), action: row.action_label, href: row.href };
}

export function mapSocial(accounts: Row<"connected_accounts">[], snapshots: Row<"social_snapshots">[]) {
  const platforms: Platform[] = ["youtube", "tiktok", "instagram"];
  const connectedAccounts: ConnectedAccount[] = accounts.map((row) => ({
    id: row.id, platform: row.platform as Platform, displayName: row.display_name, username: row.username ?? undefined, avatarUrl: row.avatar_url ?? undefined,
    status: row.status as ConnectedAccount["status"], environment: row.environment as ConnectedAccount["environment"] ?? undefined,
    grantedScopes: row.granted_scopes, lastSyncedAt: row.last_synced_at ?? undefined, lastError: row.last_error ?? undefined,
  }));
  const socialSnapshots: SocialSnapshot[] = snapshots.filter((row) => row.followers !== null && accounts.some((account) => account.id === row.connected_account_id)).map((row) => ({ id: row.id, platform: row.provider as Platform, date: row.captured_at, followers: Number(row.followers) }));
  const socialAccounts: SocialAccount[] = platforms.map((platform) => {
    const account = accounts.find((item) => item.platform === platform);
    const history = sortedHistory(snapshots.filter((row) => row.connected_account_id === account?.id && row.followers !== null).map((row) => ({ id: row.id, platform, date: row.captured_at, followers: Number(row.followers) })));
    const latest = history.at(-1);
    const comparison = previousSyncComparison(history);
    const current = Number(latest?.followers ?? 0);
    const previous = current - (comparison?.change ?? 0);
    const change = comparison?.change ?? 0;
    const status = (account?.status ?? "not_connected") as SocialAccount["status"];
    return {
      id: account?.id ?? platform, platform, displayName: account?.display_name || titleCase(platform), metricLabel: platform === "youtube" ? "Subscribers" : "Followers",
      followers: current, previousFollowers: previous, change, changePercentage: previous ? (change / previous) * 100 : undefined,
      comparisonAvailable: Boolean(comparison), dataAvailable: Boolean(latest), trend: history.slice(-12).map((item) => Number(item.followers)),
      status, lastSyncedAt: account?.last_synced_at ?? undefined,
      message: account?.last_error ?? (status === "not_connected" ? "Not connected" : undefined),
    };
  });
  return { connectedAccounts, socialAccounts, socialSnapshots };
}

export type InitialData = AppData;
