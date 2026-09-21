import type { ReactNode } from "react";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export function LegalDocument({
  eyebrow,
  title,
  introduction,
  lastUpdated,
  sections,
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <header className="legal-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="legal-updated">Last updated: {lastUpdated}</p>
        <p className="legal-introduction">{introduction}</p>
      </header>

      <div className="legal-layout">
        <aside className="legal-toc" aria-label={`${title} contents`}>
          <p className="eyebrow">On this page</p>
          <nav>
            {sections.map((section, index) => (
              <a key={section.id} href={`#${section.id}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="legal-article">
          {sections.map((section, index) => (
            <section id={section.id} key={section.id}>
              <div className="legal-section-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <h2>{section.title}</h2>
                <div className="legal-copy">{section.content}</div>
              </div>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
