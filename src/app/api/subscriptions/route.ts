import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, cleanText, jsonBody, serverError } from "@/lib/api-response";
import { mapSubscription } from "@/lib/data-mappers";

export async function POST(request: Request) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  const body = await jsonBody(request); if (!body) return badRequest("Invalid request body");
  const name = cleanText(body.name, 80), amount = Number(body.amount), cycle = String(body.billingCycle), interval = cycle === "custom" ? Number(body.customIntervalDays) : null;
  if (!name || !Number.isFinite(amount) || amount <= 0 || !["weekly", "monthly", "yearly", "custom"].includes(cycle) || (cycle === "custom" && (!Number.isInteger(interval) || Number(interval) <= 0))) return badRequest("Please check the subscription details");
  try {
    const { data, error } = await auth.supabase.from("subscriptions").insert({ user_id: auth.user.id, name, amount, currency: String(body.currency), billing_cycle: cycle, custom_interval_days: interval, renewal_date: cleanText(body.renewalDate, 10), category: cleanText(body.category, 40) || "Other", active: true }).select().single();
    if (error) throw error; return NextResponse.json(mapSubscription(data), { status: 201 });
  } catch (error) { return serverError(error); }
}

