"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { ScriptType } from "@/lib/types";

export function CreateScriptButton({
  templateId,
  type,
  label,
  children,
  variant = "primary",
  showIcon = true,
}: {
  templateId?: string;
  type?: ScriptType;
  label?: string;
  children?: ReactNode;
  variant?: "primary" | "secondary";
  showIcon?: boolean;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function createScript() {
    if (creating) return;
    setCreating(true);
    setError("");
    try {
      if (!templateId && !type) throw new Error("Choose a script type or template");
      const response = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateId ? { templateId } : { type }),
      });
      const result = await response.json() as { id?: string; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error || "Unable to create this script");
      router.push(`/scripts/${result.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create this script");
      setCreating(false);
    }
  }

  return (
    <div className="create-script-action">
      <button type="button" className={`button ${variant}`} onClick={createScript} disabled={creating}>
        {showIcon && <Plus size={17} />}{creating ? "Creating…" : children ?? label ?? "Create script"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
