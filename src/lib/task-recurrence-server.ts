import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { occurrenceDates, type RecurrenceRule } from "@/lib/task-recurrence";

type Series = Database["public"]["Tables"]["task_recurrences"]["Row"];

export function ruleFromRow(row: Series): RecurrenceRule {
  return {
    frequency: row.frequency as RecurrenceRule["frequency"], interval: row.interval_count,
    weekdays: row.weekdays, dayOfMonth: row.day_of_month, startsOn: row.starts_on,
    endsOn: row.ends_on, active: row.active,
  };
}

export async function ensureTaskOccurrences(supabase: SupabaseClient<Database>, userId: string, series: Series[], today = new Date().toISOString().slice(0, 10)) {
  const start = new Date(`${today}T00:00:00Z`);
  const from = new Date(start.getTime() - 30 * 86_400_000).toISOString().slice(0, 10);
  const through = new Date(start.getTime() + 60 * 86_400_000).toISOString().slice(0, 10);
  for (const row of series.filter((item) => item.active)) {
    const dates = occurrenceDates(ruleFromRow(row), from, through);
    if (!dates.length) continue;
    const existing = await supabase.from("tasks").select("occurrence_date").eq("user_id", userId).eq("recurrence_id", row.id).gte("occurrence_date", dates[0]).lte("occurrence_date", dates.at(-1)!);
    if (existing.error) throw existing.error;
    const found = new Set((existing.data ?? []).map((item) => item.occurrence_date));
    const missing = dates.filter((date) => !found.has(date));
    if (!missing.length) continue;
    const values = missing.map((date) => ({
      user_id: userId, recurrence_id: row.id, occurrence_date: date, due_date: date,
      title: row.title, notes: row.notes, priority: row.priority, category: row.category,
      scope: "daily", completed: false, skipped: false,
    }));
    const result = await supabase.from("tasks").upsert(values, { onConflict: "recurrence_id,occurrence_date", ignoreDuplicates: true });
    if (result.error) throw result.error;
  }
}

export async function removeFutureUncompleted(supabase: SupabaseClient<Database>, userId: string, recurrenceId: string, from: string) {
  const result = await supabase.from("tasks").delete().eq("user_id", userId).eq("recurrence_id", recurrenceId).gte("occurrence_date", from).eq("completed", false).eq("skipped", false);
  if (result.error) throw result.error;
}
