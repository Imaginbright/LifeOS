import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, cleanText, jsonBody, serverError } from "@/lib/api-response";
import { mapGoal } from "@/lib/data-mappers";

export async function POST(request: Request) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); if (!body) return badRequest("Invalid request body");
  const title = cleanText(body.title, 100), target = Number(body.targetValue), current = Number(body.currentValue);
  if (!title || !Number.isFinite(target) || target <= 0 || !Number.isFinite(current) || current < 0) return badRequest("Please check the goal details");
  try {
    const { data, error } = await auth.supabase.from("goals").insert({ user_id: auth.user.id, title, description: cleanText(body.description, 250), current_value: current, target_value: target, unit: cleanText(body.unit, 30), deadline: cleanText(body.deadline, 10), category: cleanText(body.category, 40) || "Personal" }).select().single();
    if (error) throw error;
    if (current > 0) await auth.supabase.from("goal_checkins").insert({ goal_id: data.id, user_id: auth.user.id, value: current });
    return NextResponse.json(mapGoal(data), { status: 201 });
  } catch (error) { return serverError(error); }
}

