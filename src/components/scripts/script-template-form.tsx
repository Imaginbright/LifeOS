"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseScriptMarkdown } from "@/lib/scripts/markdown-parser";
import { scriptMedia, scriptMediaForType } from "@/lib/scripts/media";
import { ScriptManuscript } from "@/components/scripts/script-manuscript";
import type { ScriptType } from "@/lib/types";

export type ScriptTemplateFormValues = {
  id?: string;
  name: string;
  type: ScriptType;
  sourceMarkdown: string;
};

function editableTemplateSource(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(":scope > section"))
    .map((section) => {
      const title = section.querySelector<HTMLHeadingElement>("header h2")?.innerText.trim() ?? "";
      const body = Array.from(section.children)
        .filter((element) => !element.matches("header"))
        .map((element) => (element as HTMLElement).innerText.trim())
        .filter(Boolean)
        .join("\n\n");
      return [title ? `## ${title}` : "", body].filter(Boolean).join("\n\n");
    })
    .filter(Boolean)
    .join("\n\n");
}

export function ScriptTemplateForm({ initial, initialType = "longform" }: { initial?: ScriptTemplateFormValues; initialType?: ScriptType }) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<ScriptType>(initial?.type ?? initialType);
  const [markdown, setMarkdown] = useState(initial?.sourceMarkdown ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const parsed = useMemo(() => parseScriptMarkdown(markdown), [markdown]);
  const medium = scriptMediaForType(type);

  async function saveTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const manuscript = editorRef.current?.querySelector<HTMLElement>(".script-manuscript");
    const sourceMarkdown = initial?.id && manuscript ? editableTemplateSource(manuscript) : markdown;
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
          <p className="page-description">{initial ? "Edit the manuscript as a document." : "Paste a complete example manuscript to reuse."}</p>
        </div>
      </header>

      <form className="script-template-form-simple" onSubmit={saveTemplate}>
        <label htmlFor="template-name">Template name</label>
        <input id="template-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={180} required placeholder="For example, First Impressions" />

        <label htmlFor="template-type">Medium</label>
        <select id="template-type" value={type} onChange={(event) => setType(event.target.value as ScriptType)}>
          {scriptMedia.map((item) => <option key={item.type} value={item.type}>{item.title}</option>)}
        </select>

        {initial ? (
          <>
            <p className="script-template-label">Manuscript</p>
            <p className="script-template-source-note">Edit the words directly. Headings and production directions stay with the manuscript.</p>
            <div className="script-template-editor-surface" ref={editorRef}>
              <ScriptManuscript sections={parsed} editable />
            </div>
          </>
        ) : (
          <>
            <label htmlFor="template-markdown">Paste manuscript</label>
            <textarea
              id="template-markdown"
              aria-label="Paste manuscript"
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              maxLength={500_000}
              required
              rows={18}
              placeholder={"# Opening\n\nPaste the finished narration and production notes here. Markdown headings, bold headings, and all-caps headings will become sections."}
            />
            <p className="script-template-source-note">Markdown is only used when you paste. Your saved template opens as a readable manuscript.</p>
            <section className="script-template-parse-preview" aria-label="Parsed manuscript preview">
              <div className="script-workspace-heading"><div><p className="eyebrow">Preview</p><h2>Manuscript sections</h2></div><span>{parsed.length}</span></div>
              {parsed.length ? (
                <ol>
                  {parsed.map((section, index) => (
                    <li key={section.id}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{section.title}</h3>{section.body && <p>{section.body.slice(0, 180)}{section.body.length > 180 ? "…" : ""}</p>}</div></li>
                  ))}
                </ol>
              ) : <p className="scripts-section-note">Paste your manuscript to preview its sections.</p>}
            </section>
          </>
        )}

        {error && <p role="alert" className="script-template-message error">{error}</p>}
        <button type="submit" className="button primary" disabled={saving}><Save size={16} />{saving ? "Saving…" : "Save template"}</button>
      </form>
    </div>
  );
}
