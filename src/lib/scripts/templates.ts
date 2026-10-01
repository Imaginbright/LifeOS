import type { ScriptType } from "@/lib/types";
import { parseScriptMarkdown, type ParsedMarkdownSection } from "@/lib/scripts/markdown-parser";

export type ScriptTemplate = {
  id: string;
  name: string;
  type: ScriptType;
  sourceMarkdown: string;
  sections: ParsedMarkdownSection[];
};

export function createSavedTemplate(input: { id: string; name: string; type: ScriptType; sourceMarkdown: string }): ScriptTemplate {
  return { ...input, sections: parseScriptMarkdown(input.sourceMarkdown) };
}

export function scriptManuscriptFromMarkdown(markdown: string) {
  return parseScriptMarkdown(markdown)
    .map((section) => {
      const heading = section.isOpening || section.title === "Script" ? "" : section.title;
      return [heading, section.body].filter(Boolean).join("\n\n");
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

export function scriptManuscriptFromStoredContent(raw: string | null) {
  if (!raw) return "";
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || !("sections" in value) || !value.sections || typeof value.sections !== "object") {
      return raw;
    }
    const sections = value.sections as Record<string, unknown>;
    if (!("structure" in value) || !Array.isArray(value.structure)) return raw;
    return value.structure
      .filter((section): section is { id: string; title: string; visualDirection?: string } =>
        Boolean(section) && typeof section === "object" && "id" in section && typeof section.id === "string" && "title" in section && typeof section.title === "string",
      )
      .map((section) => {
        const text = sections[section.id];
        const direction = section.visualDirection ? `[${section.visualDirection}]` : "";
        return [section.title, direction, typeof text === "string" ? text : ""].filter(Boolean).join("\n\n");
      })
      .join("\n\n");
  } catch {
    return raw;
  }
}

export function isValidScriptManuscript(value: unknown) {
  return typeof value === "string" && value.length <= 500_000;
}

export function isStaleScriptTemplate(name: string, sourceMarkdown: string) {
  return /^playwright ownership template$/i.test(name.trim()) ||
    (/^phone review$/i.test(name.trim()) && /Alder One/.test(sourceMarkdown));
}

export function isStaleScriptDraft(title: string) {
  return /^(?:playwright\b|untitled playwright\b)/i.test(title.trim());
}
