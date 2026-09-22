import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, cleanText, jsonBody, serverError } from "@/lib/api-response";
import { mapTask } from "@/lib/data-mappers";

export async function POST(request: Request) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); if (!body) return badRequest("Invalid request body");
  const title = cleanText(body.title, 120), scope = body.scope === "monthly" ? "monthly" : "daily";
  const priority = typeof body.priority === "string" ? body.priority.toLowerCase() : "medium";
  const categories = ["Content", "Development", "Personal", "Admin", "Health", "Other"];
  if (!title || !["low", "medium", "high"].includes(priority) || !categories.includes(String(body.category))) return badRequest("Please check the task details");
  try {
    const date = cleanText(body.date, 10);
    const { data, error } = await auth.supabase.from("tasks").insert({ user_id: auth.user.id, title, due_date: scope === "daily" ? date : null, period_month: scope === "monthly" ? `${date.slice(0, 7)}-01` : null, scope, priority, category: String(body.category), completed: false }).select().single();
    if (error) throw error; return NextResponse.json(mapTask(data), { status: 201 });
  } catch (error) { return serverError(error); }
}

