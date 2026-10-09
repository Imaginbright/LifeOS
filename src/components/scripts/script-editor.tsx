"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Cloud, RotateCw } from "lucide-react";
import { scriptMediaForType } from "@/lib/scripts/media";
import { formatScriptClipboardText } from "@/lib/scripts/clipboard";
import { useManuscriptSize } from "@/components/scripts/use-manuscript-size";
import { ScriptWorkspaceActions } from "@/components/scripts/script-workspace-actions";
import { editableScriptManuscript } from "@/lib/scripts/templates";
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
  const router = useRouter();
  const medium = scriptMediaForType(type);
  const [title, setTitle] = useState(initialTitle);
  const [rawMdx, setRawMdx] = useState(initialContent);
  const [manuscript, setManuscript] = useState(() => type === "blog" ? "" : editableScriptManuscript(initialContent));
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [retry, setRetry] = useState(0);
  const version = useRef(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const flushSave = useRef(false);
  const manuscriptInput = useManuscriptSize(type === "blog" ? rawMdx : manuscript);
  const content = type === "blog" ? rawMdx : manuscript;
  const copyText = type === "blog" ? rawMdx : formatScriptClipboardText(title, manuscript.replace(/^#{1,6}\s+/gm, ""));

  useEffect(() => {
    if (!dirty) return;
    const savedVersion = version.current;
    const timer = window.setTimeout(
      () => {
        flushSave.current = false;
        setSaveState("saving");
        const payload = JSON.stringify({ title: title.trim() || "Untitled script", content });
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

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const navigate = async (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin ||
          (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;
      event.preventDefault();
      const savedVersion = version.current;
      setSaveState("saving");
      saveQueue.current = saveQueue.current
        .catch(() => undefined)
        .then(async () => {
          if (version.current !== savedVersion) return;
          const response = await fetch(`/api/scripts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: title.trim() || "Untitled script", content }),
          });
          if (!response.ok) throw new Error("Unable to save changes");
          if (version.current !== savedVersion) return;
          setDirty(false);
          setSaveState("saved");
          router.push(destination.pathname + destination.search + destination.hash);
        })
        .catch(() => {
          if (version.current === savedVersion) setSaveState("error");
        });
      await saveQueue.current;
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", navigate, true);
    };
  }, [content, dirty, id, router, title]);

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
            onBlur={() => { if (dirty) saveNow(); }}
          />
        </div>
      </header>

      {type === "blog" ? (
        <section
          className="script-editor-document script-blog-editor"
          aria-label="Editable Blog MDX source"
        >
          <textarea
            ref={manuscriptInput}
            id="script-mdx"
            aria-label="MDX source"
            value={rawMdx}
            onChange={(event) => updateRawMdx(event.target.value)}
            onBlur={() => { if (dirty) saveNow(); }}
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
            onBlur={() => { if (dirty) saveNow(); }}
            maxLength={500_000}
            placeholder="Write your full manuscript here. Add headings or visual notes wherever you like."
            spellCheck
          />
        </section>
      )}
    </div>
  );
}
