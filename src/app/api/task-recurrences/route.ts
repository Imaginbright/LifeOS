import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";
import { recurrenceWrite } from "@/lib/mutation-input";
import { ensureTaskOccurrences } from "@/lib/task-recurrence-server";

export async function POST(request: Request) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); if (!body) return badRequest("Invalid request body");
  const values = recurrenceWrite(body); if (!values) return badRequest("Please check the recurrence details");
  try {
    const { data, error } = await auth.supabase.from("task_recurrences").insert({ user_id: auth.user.id, ...values }).select().single();
    if (error) throw error;
    await ensureTaskOccurrences(auth.supabase, auth.user.id, [data]);
    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) { return serverError(error); }
}
