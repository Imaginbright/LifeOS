"use client";

import { Plus, Trash2 } from "lucide-react";
import type { VideoScriptSection } from "@/lib/scripts/templates";

export function ScriptSectionEditor({
  sections,
  onChange,
}: {
  sections: VideoScriptSection[];
  onChange: (sections: VideoScriptSection[]) => void;
}) {
  function updateSection(index: number, patch: Partial<VideoScriptSection>) {
    onChange(sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...patch } : section));
  }

  function addSection() {
    onChange([...sections, {
      id: `section-${crypto.randomUUID()}`,
      title: "New section",
      visuals: [],
      body: "",
    }]);
  }

  return (
    <div className="script-section-editor" role="group" aria-label="Structured manuscript">
      {sections.map((section, index) => (
        <section className="script-document-section script-editable-section" key={section.id}>
          <header>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>
              <input
                aria-label={`${section.title || `Section ${index + 1}`} heading`}
                value={section.title}
                onChange={(event) => updateSection(index, { title: event.target.value })}
                maxLength={180}
              />
            </h2>
            <button
              type="button"
              className="script-remove-section"
              aria-label={`Remove ${section.title || `section ${index + 1}`}`}
              onClick={() => onChange(sections.filter((_, sectionIndex) => sectionIndex !== index))}
            >
              <Trash2 size={15} />
            </button>
          </header>
          <textarea
            className="script-section-visuals"
            aria-label={`${section.title || `Section ${index + 1}`} visual directions`}
            value={section.visuals.join("\n")}
            rows={1}
            onChange={(event) => updateSection(index, {
              visuals: event.target.value.split("\n").map((visual) => visual.trim()).filter(Boolean),
            })}
            placeholder="Visual direction (optional)"
            spellCheck
          />
          <textarea
            className="script-section-body"
            aria-label={`${section.title || `Section ${index + 1}`} narration`}
            value={section.body}
            onChange={(event) => updateSection(index, { body: event.target.value })}
            rows={8}
            placeholder="Write the narration for this section."
            spellCheck
          />
        </section>
      ))}
      <button type="button" className="script-add-section" onClick={addSection}>
        <Plus size={15} /> Add section
      </button>
    </div>
  );
}
