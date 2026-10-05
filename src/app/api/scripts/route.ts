import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { badRequest, cleanText, jsonBody, serverError } from "@/lib/api-response";
import { scriptMediaForType } from "@/lib/scripts/media";
import { scriptContentFromTemplate } from "@/lib/scripts/templates";
import type { ScriptType } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await jsonBody(request);
  if (!body) return badRequest("Invalid request body");

  const templateId = typeof body.templateId === "string" ? body.templateId : null;
  const requestedType = ["longform", "shorts", "blog"].includes(body.type as string)
    ? body.type as ScriptType
    : null;
  if (!templateId && !requestedType) return badRequest("Choose a script type or template");

  try {
    let scriptType = requestedType;
    let attachedTemplateId: string | null = null;
    let defaultTitle = scriptType ? `Untitled ${scriptMediaForType(scriptType).title} script` : "Untitled script";
    let content = "";

    if (templateId) {
      const { data: template, error: templateError } = await auth.supabase
        .from("script_templates")
        .select("id,name,type,source_markdown")
        .eq("id", templateId)
        .eq("user_id", auth.user.id)
        .maybeSingle();
      if (templateError) throw templateError;
      if (!template || !["longform", "shorts", "blog"].includes(template.type)) {
        return badRequest("That template is not available in your account");
      }
      scriptType = template.type as ScriptType;
      attachedTemplateId = template.id;
      defaultTitle = `Untitled ${template.name.toLowerCase()}`;
      content = scriptContentFromTemplate(scriptType, template.source_markdown);
    }

    if (!scriptType) return badRequest("Choose a script type or template");
    const title = cleanText(body.title, 180) || defaultTitle;
    const { data, error } = await auth.supabase
      .from("scripts")
      .insert({
        user_id: auth.user.id,
        title,
        type: scriptType,
        status: "draft",
        template_id: attachedTemplateId,
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
