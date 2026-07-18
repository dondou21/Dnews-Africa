"use client";

import { GripVertical, Eye, EyeOff, Trash2, ChevronUp, ChevronDown, Settings } from "lucide-react";
import { SECTION_TYPES } from "@dnews/types";
import type { Section } from "@dnews/types";

interface SectionCardProps {
  section: Section;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onEdit: () => void;
  dragHandleProps?: Record<string, unknown>;
}

export default function SectionCard({
  section, index, total,
  onMoveUp, onMoveDown, onToggleVisibility, onRemove, onEdit,
}: SectionCardProps) {
  const typeInfo = SECTION_TYPES.find(t => t.value === section.type);
  const typeLabel = typeInfo?.label ?? section.type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className={`group flex items-center gap-3 rounded-sm border border-dnews-border p-3 transition-colors hover:border-dnews-accent/30 ${!section.visible ? "opacity-50" : ""}`}>
      <button className="cursor-grab text-dnews-muted hover:text-dnews-accent touch-none" title="Drag to reorder">
        <GripVertical size={16} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-dnews-accent uppercase tracking-wider">{typeLabel}</span>
          <span className="text-xs text-dnews-muted">#{section.position + 1}</span>
        </div>
        {section.title && (
          <p className="text-sm font-medium text-dnews-dark truncate mt-0.5">{section.title}</p>
        )}
        {section.subtitle && (
          <p className="text-xs text-dnews-muted truncate">{section.subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent" title="Settings">
          <Settings size={14} />
        </button>
        {index > 0 && (
          <button onClick={onMoveUp} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent" title="Move up">
            <ChevronUp size={14} />
          </button>
        )}
        {index < total - 1 && (
          <button onClick={onMoveDown} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent" title="Move down">
            <ChevronDown size={14} />
          </button>
        )}
        <button onClick={onToggleVisibility} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent" title={section.visible ? "Hide" : "Show"}>
          {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button onClick={onRemove} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-red" title="Remove">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
