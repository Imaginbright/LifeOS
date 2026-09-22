"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/shared/app-provider";

export function EntityActions({
  kind,
  name,
  onEdit,
  onDelete,
}: {
  kind: "task" | "goal";
  name: string;
  onEdit: () => void;
  onDelete: () => Promise<unknown>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { error, clearError } = useApp();
  const label = kind === "task" ? "task" : "goal";
  const remove = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      if (await onDelete()) setConfirming(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger className="icon-button entity-actions-trigger" aria-label={`Actions for ${name}`}>
          <MoreHorizontal size={19} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="entity-menu" sideOffset={5} align="end">
            <DropdownMenu.Item className="entity-menu-item" onSelect={onEdit}><Pencil size={15} />Edit</DropdownMenu.Item>
            <DropdownMenu.Item className="entity-menu-item destructive-text" onSelect={() => { clearError(); setConfirming(true); }}><Trash2 size={15} />Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <Dialog.Root open={confirming} onOpenChange={(open) => { if (!deleting) setConfirming(open); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content className="dialog-content confirm-content">
            <Dialog.Title>Delete {label}?</Dialog.Title>
            <Dialog.Description>{kind === "task" ? "This task will be permanently removed." : "This will permanently remove the goal and its progress history."}</Dialog.Description>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-actions">
              <Dialog.Close className="button secondary" disabled={deleting}>Cancel</Dialog.Close>
              <button className="button destructive-button" disabled={deleting} onClick={() => void remove()}>{deleting ? "Deleting…" : `Delete ${label}`}</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
