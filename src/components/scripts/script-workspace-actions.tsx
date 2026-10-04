"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ScriptWorkspaceActionsProps = {
  resource: "script" | "template";
  id: string;
  name: string;
  returnHref: string;
  copyText?: string;
  copyLabel?: string;
  copyFeedbackText?: string;
  canCopy?: boolean;
};

export function ScriptWorkspaceActions({
  resource,
  id,
  name,
  returnHref,
  copyText,
  copyLabel = "Copy script",
  copyFeedbackText = "Script copied",
  canCopy = false,
}: ScriptWorkspaceActionsProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<"copied" | "error" | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  const label = resource === "script" ? "script" : "template";
  const endpoint = resource === "script" ? `/api/scripts/${id}` : `/api/script-templates/${id}`;

  useEffect(() => () => {
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current);
  }, []);

  async function copyScript() {
    if (!canCopy || copyText === undefined) return;
    if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable");
      await navigator.clipboard.writeText(copyText);
      setCopyFeedback("copied");
      feedbackTimer.current = window.setTimeout(() => setCopyFeedback(null), 1800);
    } catch {
      setCopyFeedback("error");
      feedbackTimer.current = window.setTimeout(() => setCopyFeedback(null), 6000);
    }
  }

  async function deleteResource() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error || `Unable to delete this ${label}`);
      }
      setConfirming(false);
      router.replace(returnHref);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : `Unable to delete this ${label}. Please try again.`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger className="icon-button script-actions-trigger" aria-label={`Actions for ${name}`}>
          <MoreHorizontal size={19} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="entity-menu" sideOffset={5} align="end">
            {resource === "script" && canCopy && (
              <DropdownMenu.Item className="entity-menu-item" onSelect={() => void copyScript()}>
                <Copy size={15} />{copyLabel}
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item className="entity-menu-item destructive-text" onSelect={() => { setDeleteError(null); setConfirming(true); }}>
              <Trash2 size={15} />Delete {label}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog.Root open={confirming} onOpenChange={(open) => { if (!deleting) setConfirming(open); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content confirm-content">
            <Dialog.Title>Delete {label}?</Dialog.Title>
            <Dialog.Description>
              {resource === "script"
                ? "This will permanently delete this script. This action cannot be undone."
                : "This will permanently remove this template. Scripts already created from it will not be deleted."}
            </Dialog.Description>
            {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
            <div className="form-actions">
              <Dialog.Close className="button secondary" disabled={deleting}>Cancel</Dialog.Close>
              <button className="button destructive-button" disabled={deleting} onClick={() => void deleteResource()}>
                {deleting ? "Deleting…" : `Delete ${label}`}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {copyFeedback && (
        <p className={`script-action-feedback ${copyFeedback}`} role="status" aria-live="polite">
          {copyFeedback === "copied" ? copyFeedbackText : "Couldn’t copy. Select the content and copy it manually."}
        </p>
      )}
    </>
  );
}
