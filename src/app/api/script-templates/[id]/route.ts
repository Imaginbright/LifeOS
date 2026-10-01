import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";
import { scriptTemplateInput } from "@/lib/scripts/template-input";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await jsonBody(request);
  if (!body) return badRequest("Invalid request body");
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  const values = scriptTemplateInput(body);
  if (!values) return badRequest("Enter a template name, choose a type, and add Markdown content under 500,000 characters");

  try {
    const { data, error } = await auth.supabase
      .from("script_templates")
      .update({ name: values.name, type: values.type, source_markdown: values.sourceMarkdown })
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("id,name,type,source_markdown,created_at,updated_at")
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Template not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  try {
    const { data, error } = await auth.supabase
      .from("script_templates")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.user.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Template not found" }, { status: 404 });
    return NextResponse.json({ id: data.id });
  } catch (error) {
    return serverError(error);
  }
}
