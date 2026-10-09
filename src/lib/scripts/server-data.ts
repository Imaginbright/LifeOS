import "server-only";

import { createHash } from "node:crypto";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { isStaleScriptDraft, isStaleScriptTemplate } from "@/lib/scripts/templates";
import type { ScriptDraft, ScriptType } from "@/lib/types";

export type ScriptTemplateSummary = {
  id: string;
  name: string;
  type: ScriptType;
  source_markdown: string;
  updated_at: string;
};

export function canonicalTemplateId(userId: string) {
  const bytes = createHash("sha256").update("lifeos:phone-review:" + userId).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
}

export async function loadScriptMediumData(type: ScriptType) {
  const supabase = await createClient();
  const { data: { user } } = await getCurrentUser();
  if (!user) return { templates: [] as ScriptTemplateSummary[], scripts: [] as ScriptDraft[] };

  const [templatesResult, scriptsResult] = await Promise.all([
    supabase.from("script_templates").select("id,name,type,source_markdown,updated_at").eq("user_id", user.id).eq("type", type).order("updated_at", { ascending: false }),
    supabase.from("scripts").select("id,title,type,status,updated_at").eq("user_id", user.id).eq("type", type).order("updated_at", { ascending: false }).limit(100),
  ]);

  const phoneReviewId = canonicalTemplateId(user.id);
  const templates = (templatesResult.data ?? [])
    .filter((item) => item.id !== phoneReviewId && !isStaleScriptTemplate(item.name, item.source_markdown))
    .map((item) => ({ ...item, type: item.type as ScriptType }));
  const scripts = (scriptsResult.data ?? [])
    .filter((item) => !isStaleScriptDraft(item.title))
    .map((item) => ({ ...item, type: item.type as ScriptType, status: item.status as ScriptDraft["status"] }));
  return { templates, scripts };
}
