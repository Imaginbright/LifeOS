import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";
import { mapGoal } from "@/lib/data-mappers";
import { goalWrite, needsGoalCheckin } from "@/lib/mutation-input";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); if (!body) return badRequest("Invalid request body");
  const progressOnly = Object.keys(body).length === 1 && Object.hasOwn(body, "currentValue");
  const values = progressOnly ? null : goalWrite(body);
  const value = Number(body.currentValue);
  if ((progressOnly && (!Number.isFinite(value) || value < 0)) || (!progressOnly && !values)) return badRequest("Please check the goal details");
  try {
    const { id } = await params;
    const { data: existing, error: readError } = await auth.supabase.from("goals").select("current_value,target_value,completed_at").eq("id", id).eq("user_id", auth.user.id).maybeSingle(); if (readError) throw readError;
    if (!existing) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    const nextValue = progressOnly ? value : values!.current_value;
    const nextTarget = progressOnly ? Number(existing.target_value) : values!.target_value;
    const completedAt = nextValue >= nextTarget ? existing.completed_at ?? new Date().toISOString() : null;
    const { data, error } = await auth.supabase.from("goals").update(progressOnly ? { current_value: nextValue, completed_at: completedAt } : { ...values!, completed_at: completedAt }).eq("id", id).eq("user_id", auth.user.id).select().single(); if (error) throw error;
    if (needsGoalCheckin(Number(existing.current_value), nextValue)) {
      const checkin = await auth.supabase.from("goal_checkins").insert({ goal_id: id, user_id: auth.user.id, value: nextValue }); if (checkin.error) throw checkin.error;
    }
    return NextResponse.json(mapGoal(data));
  } catch (error) { return serverError(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  try { const { id } = await params; const { data, error } = await auth.supabase.from("goals").delete().eq("id", id).eq("user_id", auth.user.id).select("id").maybeSingle(); if (error) throw error; if (!data) return NextResponse.json({ error: "Goal not found" }, { status: 404 }); return new NextResponse(null, { status: 204 }); } catch (error) { return serverError(error); }
}

