import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";

export async function PATCH(request: Request) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request), action = body?.action, id = typeof body?.id === "string" ? body.id : undefined;
  if (!id && action !== "read_all") return badRequest("An inbox item is required");
  try {
    let query = auth.supabase.from("inbox_items").update(action === "dismiss" ? { dismissed_at: new Date().toISOString() } : { read_at: new Date().toISOString() });
    query = id ? query.eq("id", id) : query.is("read_at", null);
    const { error } = await query; if (error) throw error; return NextResponse.json({ ok: true });
  } catch (error) { return serverError(error); }
}

