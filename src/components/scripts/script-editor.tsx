"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Cloud, RotateCw } from "lucide-react";
import { scriptMediaForType } from "@/lib/scripts/media";
import { scriptClipboardText } from "@/lib/scripts/clipboard";
import { ScriptWorkspaceActions } from "@/components/scripts/script-workspace-actions";
import {
  videoScriptSectionsFromMarkdown,
  videoScriptSectionsFromStoredContent,
  videoScriptSectionsToMarkdown,
} from "@/lib/scripts/templates";
import type { ScriptType } from "@/lib/types";

type SaveState = "saved" | "saving" | "error";

export function ScriptEditor({
  id,
  initialTitle,
  initialContent,
  type,
}: {
  id: string;
  initialTitle: string;
  initialContent: string;
  type: ScriptType;
}) {
  const medium = scriptMediaForType(type);
  const [title, setTitle] = useState(initialTitle);
  const [rawMdx, setRawMdx] = useState(initialContent);
  const [manuscript, setManuscript] = useState(() =>
    type === "blog"
      ? ""
      : videoScriptSectionsToMarkdown(
          videoScriptSectionsFromStoredContent(initialContent),
        ),
  );
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [retry, setRetry] = useState(0);
  const version = useRef(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const flushSave = useRef(false);
  const manuscriptInput = useRef<HTMLTextAreaElement>(null);
  const content = type === "blog" ? rawMdx : manuscript;
  const sections = useMemo(
    () => (type === "blog" ? [] : videoScriptSectionsFromMarkdown(manuscript)),
    [manuscript, type],
  );
  const copyText = scriptClipboardText(type, title, rawMdx, sections);

  useEffect(() => {
    const input = manuscriptInput.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${input.scrollHeight}px`;
  }, [manuscript, type]);

  useEffect(() => {
    if (!dirty) return;
    const savedVersion = version.current;
    const timer = window.setTimeout(
      () => {
        flushSave.current = false;
        setSaveState("saving");
        const payload = JSON.stringify({ title, content });
        saveQueue.current = saveQueue.current
          .catch(() => undefined)
          .then(async () => {
            const response = await fetch(`/api/scripts/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: payload,
            });
            if (!response.ok) {
              const result = (await response.json().catch(() => null)) as {
                error?: string;
              } | null;
              throw new Error(result?.error || "Unable to save changes");
            }
            if (version.current === savedVersion) {
              setDirty(false);
              setSaveState("saved");
            }
          })
          .catch(() => {
            if (version.current === savedVersion) setSaveState("error");
          });
      },
      flushSave.current ? 0 : 700,
    );
    return () => window.clearTimeout(timer);
  }, [content, dirty, id, retry, title]);

  function markDirty() {
    version.current += 1;
    setDirty(true);
    setSaveState("saving");
  }

  function updateTitle(value: string) {
    setTitle(value);
    markDirty();
  }

  function updateRawMdx(value: string) {
    setRawMdx(value);
    markDirty();
  }

  function updateManuscript(value: string) {
    setManuscript(value);
    markDirty();
  }

  function saveNow() {
    flushSave.current = true;
    setRetry((value) => value + 1);
  }

  return (
    <div className="scripts-home script-editor-page">
      <header className="page-header scripts-page-header script-editor-header">
        <div className="script-editor-title">
          <div className="script-editor-toolbar">
            <Link href={`/scripts/${medium.slug}`} className="script-back-link">
              <ArrowLeft size={16} />
              {medium.title}
            </Link>
            <div className="script-editor-utilities">
              <p
                className={`script-save-state ${saveState}`}
                role="status"
                aria-live="polite"
              >
                {saveState === "saved" ? (
                  <>
                    <Check size={15} />
                    Saved
                  </>
                ) : saveState === "saving" ? (
                  <>
                    <Cloud size={15} />
                    Saving…
                  </>
                ) : (
                  <>
                    <span>Save failed</span>
                    <button
                      type="button"
                      onClick={saveNow}
                      aria-label="Retry saving"
                    >
                      <RotateCw size={15} />
                    </button>
                  </>
                )}
              </p>
              <ScriptWorkspaceActions
                resource="script"
                id={id}
                name={title || "script"}
                returnHref={`/scripts/${medium.slug}`}
                copyText={copyText}
                copyLabel={type === "blog" ? "Copy MDX" : "Copy script"}
                copyFeedbackText={
                  type === "blog" ? "MDX copied" : "Script copied"
                }
                canCopy={!dirty && saveState === "saved"}
              />
            </div>
          </div>
          <label htmlFor="script-title">Script title</label>
          <input
            id="script-title"
            value={title}
            maxLength={180}
            placeholder="Script title"
            onChange={(event) => updateTitle(event.target.value)}
          />
        </div>
      </header>

      {type === "blog" ? (
        <section
          className="script-editor-document script-blog-editor"
          aria-label="Editable Blog MDX source"
        >
          <textarea
            id="script-mdx"
            aria-label="MDX source"
            value={rawMdx}
            onChange={(event) => updateRawMdx(event.target.value)}
            maxLength={500_000}
            placeholder="Your MDX source starts here."
            spellCheck
          />
          <p className="script-writing-hint">
            Your changes save automatically.
          </p>
        </section>
      ) : (
        <section
          className="script-editor-document script-video-editor"
          aria-label="Editable script manuscript"
        >
          <textarea
            ref={manuscriptInput}
            id="script-manuscript"
            className="script-manuscript-editor"
            aria-label="Script manuscript"
            value={manuscript}
            onChange={(event) => updateManuscript(event.target.value)}
            maxLength={500_000}
            placeholder="Write your full manuscript here. Add headings or visual notes wherever you like."
            spellCheck
          />
        </section>
      )}
    </div>
  );
}
