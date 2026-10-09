import { notFound } from "next/navigation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { createSavedTemplate, isStaleScriptTemplate } from "@/lib/scripts/templates";
import type { ScriptType } from "@/lib/types";
import { ScriptTemplateForm } from "@/components/scripts/script-template-form";
import { ScriptTemplatePage } from "@/components/scripts/script-template-page";

export async function ScriptTemplateRoute({ id, type, edit = false }: { id: string; type: ScriptType; edit?: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await getCurrentUser();
  if (!user) notFound();

  const { data, error } = await supabase
    .from("script_templates")
    .select("id,name,type,source_markdown")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("type", type)
    .maybeSingle();
  if (error || !data || isStaleScriptTemplate(data.name, data.source_markdown)) notFound();

  if (edit) {
    return <ScriptTemplateForm initial={{ id: data.id, name: data.name, type, sourceMarkdown: data.source_markdown }} />;
  }

  return <ScriptTemplatePage template={createSavedTemplate({ id: data.id, name: data.name, type, sourceMarkdown: data.source_markdown })} />;
}
