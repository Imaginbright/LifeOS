import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, cleanText, jsonBody, serverError } from "@/lib/api-response";
import type { Database } from "@/lib/database.types";

export async function PATCH(request: Request) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); if (!body) return badRequest("Invalid request body");
  const values: Database["public"]["Tables"]["profiles"]["Update"] = {};
  if (body.name !== undefined) values.display_name = cleanText(body.name, 80);
  if (["light", "dark", "system"].includes(String(body.appearance))) values.appearance = String(body.appearance);
  if (["NGN", "USD", "GBP", "EUR"].includes(String(body.currency))) values.currency = String(body.currency);
  if (["sunday", "monday"].includes(String(body.startOfWeek))) values.start_of_week = String(body.startOfWeek);
  if (typeof body.notifications === "boolean") values.notifications = body.notifications;
  if (body.timezone !== undefined) values.timezone = cleanText(body.timezone, 80);
  if (!Object.keys(values).length || values.display_name === "") return badRequest("No valid profile changes were provided");
  try { const { error } = await auth.supabase.from("profiles").update(values).eq("id", auth.user.id); if (error) throw error; return NextResponse.json({ ok: true }); } catch (error) { return serverError(error); }
}
