"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X, Save } from "lucide-react";

interface FullScreenEditorProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSave?: () => void;
  saveLabel?: string;
  children: ReactNode;
}

export default function FullScreenEditor({
  open,
  title,
  onClose,
  onSave,
  saveLabel,
  children,
}: FullScreenEditorProps) {
  const onCloseRef = useRef(onClose);
  const onSaveRef = useRef(onSave);
  onCloseRef.current = onClose;
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        onSaveRef.current?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-dnews-bg dark:bg-black">
      <div className="flex items-center justify-between gap-3 border-b border-dnews-border bg-dnews-card px-4 py-3">
        <h3 className="truncate font-heading text-sm font-semibold text-dnews-dark">
          {title}
        </h3>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-[11px] text-dnews-muted md:inline">
            Esc to close · Ctrl/Cmd + S to save
          </span>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-1.5 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
            >
              <Save size={14} />
              {saveLabel || "Save"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            aria-label="Close full screen editor"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">{children}</div>
    </div>
  );
}
