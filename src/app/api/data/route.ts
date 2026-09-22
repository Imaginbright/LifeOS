import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { mapGoal, mapInbox, mapSocial, mapSubscription, mapTask } from "@/lib/data-mappers";
import { syncInboxForUser } from "@/lib/inbox-sync";
import { serverError } from "@/lib/api-response";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  try {
    await syncInboxForUser(auth.user.id);
    const { supabase, user } = auth;
    const [profileResult, tasksResult, goalsResult, subscriptionsResult, inboxResult, accountsResult, snapshotsResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("tasks").select("*").order("due_date", { ascending: true }),
      supabase.from("goals").select("*").order("deadline", { ascending: true }),
      supabase.from("subscriptions").select("*").order("renewal_date", { ascending: true }),
      supabase.from("inbox_items").select("*").is("dismissed_at", null).is("resolved_at", null).order("event_at", { ascending: false }),
      supabase.from("connected_accounts").select("*").neq("status", "not_connected"),
      supabase.from("social_snapshots").select("*").order("captured_at", { ascending: true }),
    ]);
    const firstError = [profileResult, tasksResult, goalsResult, subscriptionsResult, inboxResult, accountsResult, snapshotsResult].find((result) => result.error)?.error;
    if (firstError) throw firstError;
    let profile = profileResult.data;
    if (!profile) {
      const fallbackName = user.email?.split("@")[0] || "You";
      const result = await supabase.from("profiles").insert({ id: user.id, email: user.email, display_name: fallbackName }).select().single();
      if (result.error) throw result.error;
      profile = result.data;
    }
    const social = mapSocial(accountsResult.data ?? [], snapshotsResult.data ?? []);
    return NextResponse.json({
      tasks: (tasksResult.data ?? []).map(mapTask), goals: (goalsResult.data ?? []).map(mapGoal), subscriptions: (subscriptionsResult.data ?? []).map(mapSubscription), inbox: (inboxResult.data ?? []).map(mapInbox),
      preferences: { appearance: profile.appearance, currency: profile.currency, startOfWeek: profile.start_of_week, notifications: profile.notifications, name: profile.display_name || user.email?.split("@")[0] || "You", email: profile.email ?? user.email, timezone: profile.timezone },
      ...social,
    });
  } catch (error) { return serverError(error); }
}

