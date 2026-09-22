import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";
import { mapTask } from "@/lib/data-mappers";
import { taskWrite } from "@/lib/mutation-input";

export async function POST(request: Request) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); if (!body) return badRequest("Invalid request body");
  const values = taskWrite(body);
  if (!values) return badRequest("Please check the task details");
  try {
    const { data, error } = await auth.supabase.from("tasks").insert({ user_id: auth.user.id, ...values, completed: false }).select().single();
    if (error) throw error; return NextResponse.json(mapTask(data), { status: 201 });
  } catch (error) { return serverError(error); }
}

