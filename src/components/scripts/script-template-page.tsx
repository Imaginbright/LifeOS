import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateScriptButton } from "@/components/scripts/create-script-button";
import { scriptMediaForType } from "@/lib/scripts/media";
import type { ScriptTemplate } from "@/lib/scripts/templates";
import { ScriptManuscript } from "@/components/scripts/script-manuscript";
import { ScriptWorkspaceActions } from "@/components/scripts/script-workspace-actions";

export function ScriptTemplatePage({ template }: { template: ScriptTemplate }) {
  const medium = scriptMediaForType(template.type);
  const base = `/scripts/${medium.slug}`;

  return (
    <div className="scripts-home script-template-page">
      <header className="page-header scripts-page-header script-template-header">
        <div>
          <Link href={base} className="script-back-link"><ArrowLeft size={16} />{medium.title}</Link>
          <p className="eyebrow">{medium.title} / Template</p>
          <h1>{template.name}</h1>
        </div>
        <div className="script-medium-actions">
          <Link href={`${base}/templates/${template.id}/edit`} className="button secondary">Edit template</Link>
          <CreateScriptButton templateId={template.id}>Start script</CreateScriptButton>
          <ScriptWorkspaceActions resource="template" id={template.id} name={template.name} returnHref={base} />
        </div>
      </header>

      {template.type === "blog" ? (
        <pre className="script-blog-source" aria-label="Raw MDX source"><code>{template.sourceMarkdown}</code></pre>
      ) : template.sections.length ? (
        <ScriptManuscript sections={template.sections} />
      ) : (
        <p className="script-workspace-empty">This template has no readable sections. Edit it to add the manuscript.</p>
      )}
    </div>
  );
}
