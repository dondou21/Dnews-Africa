"use client";

import { Check, CloudUpload, AlertTriangle, PencilLine, Clock } from "lucide-react";
import type { AutosaveStatus } from "@/lib/draftAutosave";

interface DraftSaveIndicatorProps {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
}

function formatSavedTime(date: Date | null): string {
  if (!date) return "";
  const diff = Date.now() - date.getTime();
  if (diff < 0) return "";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function DraftSaveIndicator({ status, lastSavedAt }: DraftSaveIndicatorProps) {
  const config: Record<AutosaveStatus, { label: string; className: string; Icon: typeof Clock }> = {
    idle: {
      label: "Draft autosave on",
      className: "border-dnews-border bg-dnews-card text-dnews-gray",
      Icon: Clock,
    },
    saving: {
      label: "Saving...",
      className: "border-dnews-accent/30 bg-dnews-accent/5 text-dnews-accent",
      Icon: CloudUpload,
    },
    saved: {
      label: lastSavedAt ? `Saved ${formatSavedTime(lastSavedAt)}` : "Saved",
      className: "border-dnews-green/30 bg-dnews-green/5 text-dnews-green",
      Icon: Check,
    },
    unsaved: {
      label: "Unsaved changes",
      className: "border-amber-300 bg-amber-50 text-amber-700",
      Icon: PencilLine,
    },
    error: {
      label: "Save failed",
      className: "border-dnews-red/30 bg-dnews-red/5 text-dnews-red",
      Icon: AlertTriangle,
    },
  };

  const { label, className, Icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[11px] font-medium ${className}`}
      title="Your work is saved automatically. Changes are kept even if you leave or close this page."
    >
      <Icon size={13} className={status === "saving" ? "animate-pulse" : ""} />
      {label}
    </span>
  );
}
