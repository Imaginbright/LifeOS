import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, cleanText, jsonBody, serverError } from "@/lib/api-response";
import { scriptContentFromTemplate } from "@/lib/scripts/templates";
import type { ScriptType } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await jsonBody(request);
  if (!body || typeof body.templateId !== "string") return badRequest("Choose a script template");

  try {
    const { data: template, error: templateError } = await auth.supabase
      .from("script_templates")
      .select("id,name,type,source_markdown")
      .eq("id", body.templateId)
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (templateError) throw templateError;
    if (!template || !["longform", "shorts", "blog"].includes(template.type)) {
      return badRequest("That template is not available in your account");
    }

    const title = cleanText(body.title, 180) || `Untitled ${template.name.toLowerCase()}`;
    const content = scriptContentFromTemplate(template.type as ScriptType, template.source_markdown);
    const { data, error } = await auth.supabase
      .from("scripts")
      .insert({
        user_id: auth.user.id,
        title,
        type: template.type,
        status: "draft",
        template_id: template.id,
        content,
      })
      .select("id,title")
      .single();
    if (error) throw error;
    return NextResponse.json({ id: data.id, title: data.title }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
