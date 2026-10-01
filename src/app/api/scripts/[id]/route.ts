import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, cleanText, jsonBody, serverError } from "@/lib/api-response";
import { isValidScriptManuscript } from "@/lib/scripts/templates";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const body = await jsonBody(request);
  if (!body) return badRequest("Invalid request body");
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  const update: { title?: string; content?: string } = {};
  if (Object.hasOwn(body, "title")) {
    const title = cleanText(body.title, 180);
    if (!title || typeof body.title !== "string" || body.title.trim().length > 180) return badRequest("Enter a title between 1 and 180 characters");
    update.title = title;
  }
  if (Object.hasOwn(body, "content")) {
    if (!isValidScriptManuscript(body.content)) return badRequest("The manuscript is too long to save");
    update.content = body.content as string;
  }
  if (Object.keys(update).length === 0) return badRequest("There are no script changes to save");

  try {
    const { data, error } = await auth.supabase
      .from("scripts")
      .update(update)
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("id,title,updated_at")
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Script not found" }, { status: 404 });
    return NextResponse.json({ id: data.id, title: data.title, updated_at: data.updated_at });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  try {
    const { data, error } = await auth.supabase
      .from("scripts")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Script not found" }, { status: 404 });
    return NextResponse.json({ id: data.id });
  } catch (error) {
    return serverError(error);
  }
}
