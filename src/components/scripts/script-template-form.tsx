"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { scriptMedia, scriptMediaForType } from "@/lib/scripts/media";
import { ScriptSectionEditor } from "@/components/scripts/script-section-editor";
import { videoScriptSectionsFromMarkdown, videoScriptSectionsToMarkdown, type VideoScriptSection } from "@/lib/scripts/templates";
import type { ScriptType } from "@/lib/types";

export type ScriptTemplateFormValues = {
  id?: string;
  name: string;
  type: ScriptType;
  sourceMarkdown: string;
};

export function ScriptTemplateForm({ initial, initialType = "longform" }: { initial?: ScriptTemplateFormValues; initialType?: ScriptType }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<ScriptType>(initial?.type ?? initialType);
  const [markdown, setMarkdown] = useState(initial?.sourceMarkdown ?? "");
  const [sections, setSections] = useState<VideoScriptSection[]>(() => initial && initial.type !== "blog" ? videoScriptSectionsFromMarkdown(initial.sourceMarkdown) : []);
  const [sectionsEdited, setSectionsEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const parsed = useMemo(
    () => type === "blog" ? [] : initial?.id ? sections : videoScriptSectionsFromMarkdown(markdown),
    [initial?.id, markdown, sections, type],
  );
  const medium = scriptMediaForType(type);

  function changeType(nextType: ScriptType) {
    if (initial?.id && type !== "blog" && nextType === "blog" && sectionsEdited) {
      setMarkdown(videoScriptSectionsToMarkdown(sections));
    }
    if (initial?.id && type === "blog" && nextType !== "blog") {
      setSections(videoScriptSectionsFromMarkdown(markdown));
      setSectionsEdited(false);
    }
    setType(nextType);
  }

  async function saveTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sourceMarkdown = initial?.id && type !== "blog" && sectionsEdited
      ? videoScriptSectionsToMarkdown(sections)
      : markdown;
    if (!name.trim() || !sourceMarkdown.trim()) {
      setError("Add a template name and manuscript text.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(initial?.id ? `/api/script-templates/${initial.id}` : "/api/script-templates", {
        method: initial?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, sourceMarkdown }),
      });
      const result = await response.json() as { id?: string; type?: ScriptType; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error || "Unable to save this template.");
      const savedMedium = scriptMedia.find((item) => item.type === (result.type ?? type)) ?? medium;
      router.push(`/scripts/${savedMedium.slug}/templates/${result.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this template.");
      setSaving(false);
    }
  }

  return (
    <div className="scripts-home script-template-form-page">
      <header className="page-header scripts-page-header">
        <div>
          <Link href={`/scripts/${medium.slug}`} className="script-back-link"><ArrowLeft size={16} />{medium.title}</Link>
          <p className="eyebrow">{medium.title} / Templates</p>
          <h1>{initial ? "Edit template" : "New template"}</h1>
          <p className="page-description">{type === "blog" ? "Edit the original MDX source." : initial ? "Edit each section of the manuscript." : "Paste a complete example manuscript to reuse."}</p>
        </div>
      </header>

      <form className="script-template-form-simple" onSubmit={saveTemplate}>
        <label htmlFor="template-name">Template name</label>
        <input id="template-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={180} required placeholder="For example, First Impressions" />

        <label htmlFor="template-type">Medium</label>
        <select id="template-type" value={type} onChange={(event) => changeType(event.target.value as ScriptType)}>
          {scriptMedia.map((item) => <option key={item.type} value={item.type}>{item.title}</option>)}
        </select>

        {initial?.id && type !== "blog" ? (
          <>
            <p className="script-template-label">Manuscript</p>
            <p className="script-template-source-note">Headings, visual directions, and narration stay together in each section.</p>
            <div className="script-template-editor-surface">
              <ScriptSectionEditor sections={sections} onChange={(next) => { setSections(next); setSectionsEdited(true); }} />
            </div>
          </>
        ) : (
          <>
            <label htmlFor="template-markdown">{type === "blog" ? "MDX source" : "Paste manuscript"}</label>
            <textarea
              id="template-markdown"
              aria-label={type === "blog" ? "MDX source" : "Paste manuscript"}
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              maxLength={500_000}
              required
              rows={18}
              className={type === "blog" ? "script-raw-mdx-input" : undefined}
              placeholder={type === "blog"
                ? "# Article title\n\nPaste the complete MDX source here. Headings, JSX, and code blocks are kept intact."
                : "# Hook\n\nPaste the finished narration and production notes here. Markdown headings, bold headings, and all-caps headings will become sections."}
            />
            <p className="script-template-source-note">{type === "blog"
              ? "The MDX source is saved and copied exactly as entered."
              : "Your pasted Markdown stays available as the template source."}</p>
            {type !== "blog" && (
              <section className="script-template-parse-preview" aria-label="Parsed manuscript preview">
                <div className="script-workspace-heading"><div><p className="eyebrow">Preview</p><h2>Manuscript sections</h2></div><span>{parsed.length}</span></div>
                {parsed.length ? (
                  <ol>
                    {parsed.map((section, index) => (
                      <li key={section.id}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <div><h3>{section.title}</h3>
                          {section.visuals.map((visual, visualIndex) => <p className="script-visual-direction" key={`${section.id}-visual-${visualIndex}`}>{visual}</p>)}
                          {section.body && <p>{section.body.slice(0, 180)}{section.body.length > 180 ? "…" : ""}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : <p className="scripts-section-note">Paste your manuscript to preview its sections.</p>}
              </section>
            )}
          </>
        )}

        {error && <p role="alert" className="script-template-message error">{error}</p>}
        <button type="submit" className="button primary" disabled={saving}><Save size={16} />{saving ? "Saving…" : "Save template"}</button>
      </form>
    </div>
  );
}
