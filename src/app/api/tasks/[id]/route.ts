import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";
import { mapTask } from "@/lib/data-mappers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); if (!body || typeof body.completed !== "boolean") return badRequest("A completion state is required");
  try {
    const { id } = await params;
    const { data, error } = await auth.supabase.from("tasks").update({ completed: body.completed, completed_at: body.completed ? new Date().toISOString() : null }).eq("id", id).select().single();
    if (error) throw error; return NextResponse.json(mapTask(data));
  } catch (error) { return serverError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  try { const { id } = await params; const { error } = await auth.supabase.from("tasks").delete().eq("id", id); if (error) throw error; return new NextResponse(null, { status: 204 }); }
  catch (error) { return serverError(error); }
}

