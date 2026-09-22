import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { serverError } from "@/lib/api-response";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(); if ("response" in auth) return auth.response;
  try { const { id } = await params; const { error } = await auth.supabase.from("subscriptions").delete().eq("id", id); if (error) throw error; return new NextResponse(null, { status: 204 }); } catch (error) { return serverError(error); }
}

