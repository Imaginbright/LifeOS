import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, jsonBody, serverError } from "@/lib/api-response";
import { scriptTemplateInput } from "@/lib/scripts/template-input";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await jsonBody(request);
  if (!body) return badRequest("Invalid request body");
  const values = scriptTemplateInput(body);
  if (!values) return badRequest("Enter a template name, choose a type, and add Markdown content under 500,000 characters");

  try {
    const { data, error } = await auth.supabase
      .from("script_templates")
      .insert({ user_id: auth.user.id, name: values.name, type: values.type, source_markdown: values.sourceMarkdown })
      .select("id,name,type,source_markdown,created_at,updated_at")
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
