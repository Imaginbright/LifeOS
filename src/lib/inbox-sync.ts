import "server-only";

import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { createAdminClient } from "@/lib/supabase/admin";
import { effectiveRenewalDate } from "@/lib/subscription-utils";
import { crossedFollowerMilestones } from "@/lib/integrations/social-metrics";
import type { Subscription } from "@/lib/types";
import { dedupeInboxEvents, goalDeadlineEventKey, renewalEventKey } from "@/lib/inbox-rules";

type GeneratedItem = {
  user_id: string;
  source_key: string;
  category: "Subscription" | "Tasks" | "Goals" | "Creator" | "System";
  title: string;
  description: string;
  event_at: string;
  action_label: string;
  href: string;
  metadata: Record<string, string | number>;
  resolved_at: null;
};

export async function syncInboxForUser(userId: string, now = new Date()) {
  const admin = createAdminClient();
  const today = format(now, "yyyy-MM-dd");
  const soon = format(addDays(now, 14), "yyyy-MM-dd");
  const [{ data: tasks }, { data: goals }, { data: subscriptions }, { data: accounts }] = await Promise.all([
    admin.from("tasks").select("id,title,due_date").eq("user_id", userId).eq("completed", false).lt("due_date", today),
    admin.from("goals").select("id,title,deadline,current_value,target_value").eq("user_id", userId).is("completed_at", null).gte("deadline", today).lte("deadline", soon),
    admin.from("subscriptions").select("id,name,amount,currency,billing_cycle,custom_interval_days,renewal_date,category,active").eq("user_id", userId).eq("active", true),
    admin.from("connected_accounts").select("id,platform,status,last_error,updated_at").eq("user_id", userId),
  ]);

  const generated: GeneratedItem[] = [];
  if (tasks?.length) {
    const oldest = [...tasks].sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))[0];
    const taskSet = tasks.map((task) => task.id).sort().join(",");
    generated.push({ user_id: userId, source_key: `lifeos:tasks-overdue:${taskSet}`, category: "Tasks", title: `${tasks.length} overdue ${tasks.length === 1 ? "task" : "tasks"}`, description: `Your oldest overdue task is “${oldest.title}”.`, event_at: now.toISOString(), action_label: "Review tasks", href: "/tasks", metadata: { count: tasks.length }, resolved_at: null });
  }

  for (const goal of goals ?? []) {
    const days = differenceInCalendarDays(parseISO(goal.deadline), now);
    generated.push({ user_id: userId, source_key: goalDeadlineEventKey(goal.id, goal.deadline), category: "Goals", title: `${goal.title} is due ${days === 0 ? "today" : `in ${days} days`}`, description: `Progress is ${Number(goal.current_value).toLocaleString()} of ${Number(goal.target_value).toLocaleString()}.`, event_at: now.toISOString(), action_label: "View goal", href: "/goals", metadata: { goalId: goal.id, days }, resolved_at: null });
  }

  for (const row of subscriptions ?? []) {
    const subscription: Subscription = { id: row.id, name: row.name, amount: Number(row.amount), currency: row.currency as Subscription["currency"], billingCycle: row.billing_cycle as Subscription["billingCycle"], customIntervalDays: row.custom_interval_days ?? undefined, renewalDate: row.renewal_date, category: row.category, active: row.active };
    const renewal = effectiveRenewalDate(subscription, today);
    const days = differenceInCalendarDays(parseISO(renewal), now);
    if (days >= 0 && days <= 7) generated.push({ user_id: userId, source_key: renewalEventKey(row.id, renewal), category: "Subscription", title: `${row.name} renews ${days === 0 ? "today" : `in ${days} days`}`, description: `${row.currency} ${Number(row.amount).toLocaleString()} is due on ${renewal}.`, event_at: now.toISOString(), action_label: "View subscription", href: "/subscriptions", metadata: { subscriptionId: row.id, renewalDate: renewal }, resolved_at: null });
  }

  for (const account of accounts ?? []) {
    if (["error", "token_expired"].includes(account.status)) generated.push({ user_id: userId, source_key: `lifeos:social-error:${account.id}:${account.updated_at.slice(0, 10)}`, category: "System", title: `${account.platform} needs attention`, description: account.last_error || "Reconnect this account to resume updates.", event_at: now.toISOString(), action_label: "Open settings", href: "/settings", metadata: { accountId: account.id }, resolved_at: null });

    const { data: history } = await admin.from("social_snapshots").select("followers,captured_at").eq("connected_account_id", account.id).not("followers", "is", null).order("captured_at", { ascending: false }).limit(2);
    if (history?.length === 2) {
      for (const milestone of crossedFollowerMilestones(Number(history[1].followers), Number(history[0].followers))) {
        generated.push({ user_id: userId, source_key: `lifeos:creator-milestone:${account.id}:${milestone}`, category: "Creator", title: `${milestone.toLocaleString()} on ${account.platform}`, description: `Your audience reached a new follower milestone.`, event_at: history[0].captured_at, action_label: "View growth", href: "/creator", metadata: { accountId: account.id, milestone }, resolved_at: null });
      }
    }
  }

  const uniqueGenerated = dedupeInboxEvents(generated);
  if (uniqueGenerated.length) {
    const { error } = await admin.from("inbox_items").upsert(uniqueGenerated, { onConflict: "user_id,source_key" });
    if (error) throw error;
  }

  const activeKeys = new Set(uniqueGenerated.map((item) => item.source_key));
  const { data: existing } = await admin.from("inbox_items").select("id,source_key").eq("user_id", userId).like("source_key", "lifeos:%").is("resolved_at", null);
  const staleIds = (existing ?? []).filter((item) => !activeKeys.has(item.source_key)).map((item) => item.id);
  if (staleIds.length) await admin.from("inbox_items").update({ resolved_at: now.toISOString() }).in("id", staleIds);
}
