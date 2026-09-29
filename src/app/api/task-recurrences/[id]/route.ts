import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";
import { isDate, recurrenceWrite } from "@/lib/mutation-input";
import { ensureTaskOccurrences, removeFutureUncompleted } from "@/lib/task-recurrence-server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); if (!body) return badRequest("Invalid request body");
  const values = recurrenceWrite(body);
  const from = typeof body.from === "string" ? body.from : "";
  if (!values || !isDate(from) || (values.ends_on && values.ends_on < from)) return badRequest("Please check the recurrence details");
  try {
    const { id } = await params;
    const current = await auth.supabase.from("task_recurrences").select("id").eq("id", id).eq("user_id", auth.user.id).maybeSingle();
    if (current.error) throw current.error;
    if (!current.data) return NextResponse.json({ error: "Recurrence not found" }, { status: 404 });
    const { data, error } = await auth.supabase.from("task_recurrences").update({ ...values, starts_on: from, active: true }).eq("id", id).eq("user_id", auth.user.id).select().single();
    if (error) throw error;
    await removeFutureUncompleted(auth.supabase, auth.user.id, id, from);
    await ensureTaskOccurrences(auth.supabase, auth.user.id, [data]);
    return NextResponse.json({ id: data.id });
  } catch (error) { return serverError(error); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const from = new URL(request.url).searchParams.get("from");
  if (!isDate(from)) return badRequest("Choose the first occurrence to stop");
  try {
    const { id } = await params;
    const { data, error } = await auth.supabase.from("task_recurrences").update({ active: false }).eq("id", id).eq("user_id", auth.user.id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Recurrence not found" }, { status: 404 });
    await removeFutureUncompleted(auth.supabase, auth.user.id, id, from);
    return new NextResponse(null, { status: 204 });
  } catch (error) { return serverError(error); }
}
