export type ParsedMarkdownSection = {
  id: string;
  title: string;
  body: string;
  visualDirection?: string;
  isOpening?: boolean;
};

function headingTitle(line: string) {
  const trimmed = line.trim();
  const markdownHeading = trimmed.match(/^#{1,6}\s+(.+?)\s*#*$/);
  if (markdownHeading) return markdownHeading[1].trim();

  const boldHeading = trimmed.match(/^\*\*(.+?)\*\*:?$/) ?? trimmed.match(/^__(.+?)__:?$/);
  if (boldHeading) return boldHeading[1].trim();

  const letters = trimmed.replace(/[^A-Za-z]/g, "");
  if (
    trimmed.length <= 90 &&
    letters.length >= 3 &&
    trimmed === trimmed.toLocaleUpperCase() &&
    !trimmed.startsWith("[") &&
    !/[.!,:;]$/.test(trimmed)
  ) return trimmed;
  return null;
}

function cleanInlineMarkdown(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.+?)\*\*|__(.+?)__/g, "$1$2")
    .replace(/\*(.+?)\*|_(.+?)_/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function sectionId(title: string, index: number) {
  const idPart = title.toLocaleLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "section";
  return `section-${String(index + 1).padStart(2, "0")}-${idPart}`;
}

export function parseScriptMarkdown(markdown: string): ParsedMarkdownSection[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const sections: Array<{ title: string; lines: string[]; isOpening?: boolean }> = [];
  let current: (typeof sections)[number] | undefined;
  let preface: string[] = [];

  const addOpening = () => {
    if (!preface.some((line) => line.trim())) return;
    sections.push({ title: "Opening", lines: preface, isOpening: true });
    current = sections[sections.length - 1];
    preface = [];
  };

  for (const line of lines) {
    if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) continue;
    if (/^\s*#{1,6}\s*#*\s*$/.test(line)) continue;

    const heading = headingTitle(line);
    if (heading) {
      if (!current) addOpening();
      current = { title: heading, lines: [] };
      sections.push(current);
      continue;
    }

    if (current) current.lines.push(line);
    else preface.push(line);
  }

  if (!sections.length) {
    const body = preface.map(cleanInlineMarkdown).join("\n").replace(/\n{3,}/g, "\n\n").trim();
    return body ? [{ id: "section-01-script", title: "Script", body }] : [];
  }

  return sections.map((section, index) => {
    const body = section.lines.map(cleanInlineMarkdown).join("\n").replace(/\n{3,}/g, "\n\n").trim();
    const directions = body.split("\n").filter((line) => /^\s*\[[^\]]+\]\s*$/.test(line.trim()));
    return {
      id: sectionId(section.title, index),
      title: section.title,
      body,
      ...(directions.length ? { visualDirection: directions.join("\n") } : {}),
      ...(section.isOpening ? { isOpening: true } : {}),
    };
  });
}
