import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { mapGoal, mapInbox, mapPreferences, mapSocial, mapSubscription, mapTask } from "@/lib/data-mappers";
import { syncInboxForUser } from "@/lib/inbox-sync";
import { serverError } from "@/lib/api-response";
import type { Database } from "@/lib/database.types";
import { ensureTaskOccurrences } from "@/lib/task-recurrence-server";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  try {
    const { supabase, user } = auth;
    const inbox = syncInboxForUser(user.id).then(() =>
      supabase.from("inbox_items").select("*").is("dismissed_at", null).is("resolved_at", null).order("event_at", { ascending: false })
    );
    const [profileResult, goalsResult, subscriptionsResult, inboxResult, accountsResult, recurrencesResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("goals").select("*").order("deadline", { ascending: true }),
      supabase.from("subscriptions").select("*").order("renewal_date", { ascending: true }),
      inbox,
      supabase.from("connected_accounts").select("*").neq("status", "not_connected"),
      supabase.from("task_recurrences").select("*").eq("user_id", user.id),
    ]);
    const firstError = [profileResult, goalsResult, subscriptionsResult, inboxResult, accountsResult].find((result) => result.error)?.error;
    if (firstError) throw firstError;
    const migrationPending = recurrencesResult.error?.code === "42P01" || recurrencesResult.error?.code === "PGRST205";
    if (recurrencesResult.error && !migrationPending) throw recurrencesResult.error;
    const accountIds = (accountsResult.data ?? []).map((account) => account.id);
    const [tasksResult, snapshots] = await Promise.all([
      (async () => {
        if (!migrationPending) await ensureTaskOccurrences(supabase, user.id, recurrencesResult.data ?? []);
        const tasksQuery = supabase.from("tasks").select("*").eq("user_id", user.id);
        return (migrationPending ? tasksQuery : tasksQuery.eq("skipped", false)).order("due_date", { ascending: true });
      })(),
      (async () => {
        const history: Database["public"]["Tables"]["social_snapshots"]["Row"][] = [];
        if (accountIds.length) {
          for (let offset = 0; ; offset += 1000) {
            const page = await supabase.from("social_snapshots").select("*").in("connected_account_id", accountIds).not("followers", "is", null).order("captured_at", { ascending: false }).order("id", { ascending: false }).range(offset, offset + 999);
            if (page.error) throw page.error;
            history.push(...(page.data ?? []));
            if ((page.data?.length ?? 0) < 1000) break;
          }
        }
        return history;
      })(),
    ]);
    if (tasksResult.error) throw tasksResult.error;
    let profile = profileResult.data;
    if (!profile) {
      const fallbackName = user.email?.split("@")[0] || "You";
      const result = await supabase.from("profiles").insert({ id: user.id, email: user.email, display_name: fallbackName }).select().single();
      if (result.error) throw result.error;
      profile = result.data;
    }
    const social = mapSocial(accountsResult.data ?? [], snapshots);
    return NextResponse.json({
      tasks: (tasksResult.data ?? []).map((task) => mapTask(task, recurrencesResult.data ?? [])), recurrenceAvailable: !migrationPending, goals: (goalsResult.data ?? []).map(mapGoal), subscriptions: (subscriptionsResult.data ?? []).map(mapSubscription), inbox: (inboxResult.data ?? []).map(mapInbox),
      preferences: mapPreferences(profile, user.email),
      ...social,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return serverError(error); }
}

