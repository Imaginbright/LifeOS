import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";
import { mapGoal } from "@/lib/data-mappers";
import { goalWrite } from "@/lib/mutation-input";

export async function POST(request: Request) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); if (!body) return badRequest("Invalid request body");
  const values = goalWrite(body);
  if (!values) return badRequest("Please check the goal details");
  try {
    const { data, error } = await auth.supabase.from("goals").insert({ user_id: auth.user.id, ...values, completed_at: values.current_value >= values.target_value ? new Date().toISOString() : null }).select().single();
    if (error) throw error;
    if (values.current_value > 0) await auth.supabase.from("goal_checkins").insert({ goal_id: data.id, user_id: auth.user.id, value: values.current_value });
    return NextResponse.json(mapGoal(data), { status: 201 });
  } catch (error) { return serverError(error); }
}

