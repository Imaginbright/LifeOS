import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { CreateScriptButton } from "@/components/scripts/create-script-button";
import { loadScriptMediumData } from "@/lib/scripts/server-data";
import { scriptMediaForType } from "@/lib/scripts/media";
import { parseScriptMarkdown } from "@/lib/scripts/markdown-parser";
import type { ScriptType } from "@/lib/types";

export async function ScriptMediumPage({ type }: { type: ScriptType }) {
  const medium = scriptMediaForType(type);
  const { templates, scripts } = await loadScriptMediumData(type);
  const createHref = `/scripts/${medium.slug}/templates/new`;

  return (
    <div className="scripts-home script-medium-page">
      <header className="page-header scripts-page-header">
        <div>
          <p className="eyebrow"><Link href="/scripts">Scripts</Link> / {medium.title}</p>
          <h1>{medium.title}</h1>
          <p className="page-description">{medium.description}</p>
        </div>
        <div className="script-medium-actions">
          <CreateScriptButton type={type} variant="secondary" showIcon={false}>New script</CreateScriptButton>
          <Link href={createHref} className="button primary"><FilePlus2 size={16} />New template</Link>
        </div>
      </header>

      <section className="script-workspace-section" id="templates" aria-labelledby="script-templates-heading">
        <div className="script-workspace-heading">
          <div><h2 id="script-templates-heading">Templates</h2></div>
          <Link href={createHref} className="script-text-link">Add a template</Link>
        </div>
        {templates.length ? (
          <ul className="script-template-list">
            {templates.map((template) => (
              <li key={template.id}>
                <Link href={`/scripts/${medium.slug}/templates/${template.id}`} className="script-workspace-link">
                  <span><strong>{template.name}</strong><small>Example manuscript · {parseScriptMarkdown(template.source_markdown).length} sections</small></span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="script-workspace-empty">
            <p>No templates yet.</p>
            <Link href={createHref}>Paste a manuscript to make one</Link>
          </div>
        )}
      </section>

      <section className="script-workspace-section script-my-scripts" aria-labelledby="my-scripts-heading">
        <div className="script-workspace-heading">
          <div><h2 id="my-scripts-heading">My Scripts</h2></div>
        </div>
        {scripts.length ? (
          <ul className="script-draft-list">
            {scripts.map((script) => (
              <li key={script.id}>
                <Link className="script-draft-link" href={`/scripts/${script.id}`}>
                  <span className="script-draft-mark" />
                  <span><strong>{script.title}</strong><small>{script.status === "draft" ? "Draft" : script.status} · Edited {new Date(script.updated_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}</small></span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="script-workspace-empty"><p>No scripts yet.</p><span>Start a draft directly or open a template first.</span></div>
        )}
      </section>

    </div>
  );
}
