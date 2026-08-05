"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import FullScreenEditor from "./FullScreenEditor";

interface ExpandableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onSave?: () => void;
  saveLabel?: string;
}

export default function ExpandableTextarea({
  value,
  onChange,
  maxLength,
  placeholder,
  rows = 4,
  disabled,
  required,
  className,
  onSave,
  saveLabel,
}: ExpandableTextareaProps) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={rows}
          required={required}
          disabled={disabled}
          className={`w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 pr-10 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent disabled:opacity-50 ${
            className ?? ""
          }`}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={disabled}
          title="Edit in full screen (Ctrl/Cmd + S to save, Esc to close)"
          aria-label="Edit in full screen"
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-sm border border-dnews-border bg-dnews-card text-dnews-gray transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent disabled:hidden"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      <FullScreenEditor
        open={open}
        title="Edit"
        onClose={close}
        onSave={onSave ?? close}
        saveLabel={saveLabel}
      >
        <textarea
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          className="h-full min-h-[70vh] w-full resize-none rounded-sm border border-dnews-border bg-dnews-card px-4 py-3 text-sm leading-relaxed text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
        />
      </FullScreenEditor>
    </>
  );
}
