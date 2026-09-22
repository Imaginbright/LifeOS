import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";
import { mapInbox } from "@/lib/data-mappers";
import { syncInboxForUser } from "@/lib/inbox-sync";

export async function GET() {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  try {
    await syncInboxForUser(auth.user.id);
    const { data, error } = await auth.supabase.from("inbox_items").select("*").eq("user_id", auth.user.id).is("dismissed_at", null).is("resolved_at", null).order("event_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json((data ?? []).map(mapInbox));
  } catch (error) { return serverError(error); }
}

export async function PATCH(request: Request) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request), action = body?.action, id = typeof body?.id === "string" ? body.id : undefined;
  if (!id && action !== "read_all") return badRequest("An inbox item is required");
  try {
    let query = auth.supabase.from("inbox_items").update(action === "dismiss" ? { dismissed_at: new Date().toISOString() } : { read_at: new Date().toISOString() });
    query = id ? query.eq("id", id) : query.is("read_at", null);
    const { error } = await query; if (error) throw error; return NextResponse.json({ ok: true });
  } catch (error) { return serverError(error); }
}

