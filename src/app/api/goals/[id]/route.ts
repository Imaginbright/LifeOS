import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";
import { mapGoal } from "@/lib/data-mappers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request), value = Number(body?.currentValue); if (!Number.isFinite(value) || value < 0) return badRequest("Progress must be zero or greater");
  try {
    const { id } = await params;
    const { data: existing, error: readError } = await auth.supabase.from("goals").select("target_value").eq("id", id).single(); if (readError) throw readError;
    const { data, error } = await auth.supabase.from("goals").update({ current_value: value, completed_at: value >= Number(existing.target_value) ? new Date().toISOString() : null }).eq("id", id).select().single(); if (error) throw error;
    const checkin = await auth.supabase.from("goal_checkins").insert({ goal_id: id, user_id: auth.user.id, value }); if (checkin.error) throw checkin.error;
    return NextResponse.json(mapGoal(data));
  } catch (error) { return serverError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  try { const { id } = await params; const { error } = await auth.supabase.from("goals").delete().eq("id", id); if (error) throw error; return new NextResponse(null, { status: 204 }); } catch (error) { return serverError(error); }
}

