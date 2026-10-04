import type { ScriptType } from "@/lib/types";
import { parseScriptMarkdown, type ParsedMarkdownSection } from "@/lib/scripts/markdown-parser";

export type VideoScriptSection = {
  id: string;
  title: string;
  visuals: string[];
  body: string;
  isOpening?: boolean;
};

export type ScriptTemplate = {
  id: string;
  name: string;
  type: ScriptType;
  sourceMarkdown: string;
  sections: ParsedMarkdownSection[];
};

export function createSavedTemplate(input: { id: string; name: string; type: ScriptType; sourceMarkdown: string }): ScriptTemplate {
  return { ...input, sections: input.type === "blog" ? [] : parseScriptMarkdown(input.sourceMarkdown) };
}

function splitSectionBody(body: string, existingVisuals: string[] = []) {
  const visuals = [...existingVisuals];
  const lines = body.replace(/\r\n?/g, "\n").split("\n");
  const narration = lines.filter((line) => {
    const trimmed = line.trim();
    if (/^\[[^\]]+\]$/.test(trimmed)) {
      if (!visuals.includes(trimmed)) visuals.push(trimmed);
      return false;
    }
    return true;
  }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { visuals, body: narration };
}

export function videoScriptSectionsFromMarkdown(markdown: string): VideoScriptSection[] {
  return parseScriptMarkdown(markdown).map((section) => {
    const existingVisuals = section.visualDirection?.split("\n").map((visual) => visual.trim()).filter(Boolean) ?? [];
    const content = splitSectionBody(section.body, existingVisuals);
    return {
      id: section.id,
      title: section.title,
      visuals: content.visuals,
      body: content.body,
      ...(section.isOpening ? { isOpening: true } : {}),
    };
  });
}

function normalizedSections(value: unknown): VideoScriptSection[] | null {
  if (!Array.isArray(value)) return null;
  return value.flatMap((section, index) => {
    if (!section || typeof section !== "object") return [];
    const item = section as Record<string, unknown>;
    if (typeof item.title !== "string" || typeof item.body !== "string") return [];
    const visuals = Array.isArray(item.visuals) ? item.visuals.filter((visual): visual is string => typeof visual === "string") : [];
    return [{
      id: typeof item.id === "string" ? item.id : `section-${String(index + 1).padStart(2, "0")}`,
      title: item.title,
      visuals,
      body: item.body,
      ...(item.isOpening === true ? { isOpening: true } : {}),
    }];
  });
}

export function videoScriptSectionsFromStoredContent(raw: string | null): VideoScriptSection[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (value && typeof value === "object") {
      const stored = value as Record<string, unknown>;
      if (stored.version === 2 && stored.format === "video-sections") {
        const sections = normalizedSections(stored.sections);
        if (sections && (sections.length > 0 || (Array.isArray(stored.sections) && stored.sections.length === 0))) return sections;
      }
      if (stored.version === 1 && Array.isArray(stored.structure) && stored.sections && typeof stored.sections === "object") {
        const sectionText = stored.sections as Record<string, unknown>;
        const sections = stored.structure.flatMap((item, index) => {
          if (!item || typeof item !== "object") return [];
          const entry = item as Record<string, unknown>;
          if (typeof entry.id !== "string" || typeof entry.title !== "string") return [];
          const existingVisuals = typeof entry.visualDirection === "string" ? entry.visualDirection.split("\n") : [];
          const content = splitSectionBody(typeof sectionText[entry.id] === "string" ? sectionText[entry.id] as string : "", existingVisuals);
          return [{
            id: entry.id || `section-${String(index + 1).padStart(2, "0")}`,
            title: entry.title,
            visuals: content.visuals,
            body: content.body,
            ...(entry.isOpening === true ? { isOpening: true } : {}),
          }];
        });
        if (sections.length > 0 || stored.structure.length === 0) return sections;
      }
    }
  } catch {
    // Older scripts stored plain manuscript text, which is parsed below.
  }
  return videoScriptSectionsFromMarkdown(raw);
}

export function serializeVideoScriptSections(sections: VideoScriptSection[]) {
  return JSON.stringify({ version: 2, format: "video-sections", sections });
}

export function videoScriptSectionsToMarkdown(sections: VideoScriptSection[]) {
  return sections.map((section) => {
    const heading = section.isOpening ? "" : `## ${section.title.trim()}`;
    const visuals = section.visuals.map(formatVisualCue);
    return [heading, ...visuals, section.body].filter(Boolean).join("\n\n");
  }).join("\n\n").trim();
}

function formatVisualCue(value: string) {
  const cue = value.trim();
  return /^\[[^\]]+\]$/.test(cue) ? cue : `[${cue}]`;
}

export function videoScriptManuscript(sections: VideoScriptSection[]) {
  return sections.map((section) => {
    const heading = section.isOpening || section.title === "Script" ? "" : section.title;
    const paragraphs = section.body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
    const visuals = section.visuals.map(formatVisualCue);
    const openingTitle = section.isOpening && paragraphs[0] && /^(?:“[^”]+”|"[^"]+")$/.test(paragraphs[0]);
    const body = openingTitle
      ? [paragraphs[0], ...visuals, paragraphs.slice(1).join("\n\n")].filter(Boolean).join("\n\n")
      : [...visuals, section.body].filter(Boolean).join("\n\n");
    return [heading, body].filter(Boolean).join("\n\n");
  }).filter(Boolean).join("\n\n").trim();
}

export function scriptContentFromTemplate(type: ScriptType, sourceMarkdown: string) {
  if (type === "blog") return sourceMarkdown;
  return serializeVideoScriptSections(videoScriptSectionsFromMarkdown(sourceMarkdown));
}

export function scriptManuscriptFromMarkdown(markdown: string) {
  return videoScriptManuscript(videoScriptSectionsFromMarkdown(markdown));
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
