"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import type { PendingDraft } from "@/lib/draftAutosave";

interface DraftRestoreDialogProps {
  draft: PendingDraft;
  onRestore: () => void;
  onDiscard: () => void;
}

function formatSavedTime(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DraftRestoreDialog({ draft, onRestore, onDiscard }: DraftRestoreDialogProps) {
  const restoreRef = useRef(onRestore);
  restoreRef.current = onRestore;
  const discardRef = useRef(onDiscard);
  discardRef.current = onDiscard;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        restoreRef.current();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const title = draft.data.title?.trim() || "Untitled article";

  return (
    <Modal
      open
      onClose={onDiscard}
      title="Unsaved draft found"
      size="md"
      footer={
        <>
          <button
            onClick={onDiscard}
            className="rounded-sm border border-dnews-border bg-dnews-card px-4 py-2 text-xs font-semibold text-dnews-gray transition-colors hover:bg-dnews-light-gray"
          >
            Discard draft
          </button>
          <button
            onClick={onRestore}
            className="rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
          >
            Continue editing
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-dnews-dark">{title}</p>
            <p className="mt-0.5 text-xs text-dnews-muted">
              Saved {formatSavedTime(draft.savedAt)}
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-dnews-gray">
          You have an unsaved draft from your last session. Continue editing to restore it, or
          discard the draft to start fresh.
        </p>
      </div>
    </Modal>
  );
}
