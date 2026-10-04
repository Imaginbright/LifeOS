import type { ParsedMarkdownSection } from "@/lib/scripts/markdown-parser";

function manuscriptParagraphs(body: string) {
  return body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

export function ScriptManuscript({
  sections,
}: {
  sections: ParsedMarkdownSection[];
}) {
  return (
    <article className="script-manuscript">
      {sections.map((section, index) => (
        <section id={section.id} className="script-document-section" key={section.id}>
          <header><span>{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2></header>
          {manuscriptParagraphs(section.body).map((paragraph, paragraphIndex) => {
            const lines = paragraph.split("\n");
            const isDirection = lines.every((line) => /^\s*\[[^\]]+\]\s*$/.test(line.trim()));
            const isOpeningTitle = section.isOpening && paragraphIndex === 0 && /^(?:“[^”]+”|"[^"]+")$/.test(paragraph);
            const text = isOpeningTitle ? paragraph.slice(1, -1) : paragraph;
            const Tag = isOpeningTitle ? "h3" : "p";
            return (
              <Tag className={isDirection ? "script-visual-direction" : isOpeningTitle ? "script-manuscript-title" : undefined} key={`${section.id}-${paragraphIndex}`}>
                {text.split("\n").map((line, lineIndex) => <span key={lineIndex}>{lineIndex > 0 && <br />}{line}</span>)}
              </Tag>
            );
          })}
        </section>
      ))}
    </article>
  );
}
