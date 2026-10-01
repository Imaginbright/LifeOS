import type { ScriptType } from "@/lib/types";

export type ScriptTemplateInput = { name: string; type: ScriptType; sourceMarkdown: string };

export function scriptTemplateInput(value: Record<string, unknown>): ScriptTemplateInput | null {
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const sourceMarkdown = typeof value.sourceMarkdown === "string" ? value.sourceMarkdown : "";
  const type = value.type;
  if (!name || name.length > 180 || !sourceMarkdown.trim() || sourceMarkdown.length > 500_000) return null;
  if (type !== "longform" && type !== "shorts" && type !== "blog") return null;
  return { name, type, sourceMarkdown };
}
