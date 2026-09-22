import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";
import { mapTask } from "@/lib/data-mappers";
import { taskWrite } from "@/lib/mutation-input";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); if (!body) return badRequest("Invalid request body");
  const completionOnly = Object.keys(body).length === 1 && typeof body.completed === "boolean";
  const values = completionOnly ? { completed: body.completed as boolean, completed_at: body.completed ? new Date().toISOString() : null } : taskWrite(body);
  if (!values) return badRequest("Please check the task details");
  try {
    const { id } = await params;
    const { data, error } = await auth.supabase.from("tasks").update(values).eq("id", id).eq("user_id", auth.user.id).select().maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(mapTask(data));
  } catch (error) { return serverError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  try { const { id } = await params; const { data, error } = await auth.supabase.from("tasks").delete().eq("id", id).eq("user_id", auth.user.id).select("id").maybeSingle(); if (error) throw error; if (!data) return NextResponse.json({ error: "Task not found" }, { status: 404 }); return new NextResponse(null, { status: 204 }); }
  catch (error) { return serverError(error); }
}

