"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Plus, GripVertical, Trash2, ChevronUp, ChevronDown,
  Type, Heading1, Quote, Image, LayoutGrid, Video,
  Minus, List, ListOrdered, Table, Link2, FileText, AlertCircle,
  Undo2, Redo2
} from "lucide-react";
import type { ContentBlock, ContentBlockType } from "@/types/contentBlocks";
import { createBlock } from "@/types/contentBlocks";
import BlockRenderer from "./BlockRenderer";

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const MAX_HISTORY = 50;

const BLOCK_TEMPLATES: { type: ContentBlockType; label: string; icon: React.ReactNode; defaultData: Record<string, unknown> }[] = [
  { type: "paragraph", label: "Paragraph", icon: <Type size={14} />, defaultData: { text: "" } },
  { type: "heading", label: "Heading", icon: <Heading1 size={14} />, defaultData: { text: "", level: "h2" } },
  { type: "quote", label: "Quote", icon: <Quote size={14} />, defaultData: { text: "", attribution: "" } },
  { type: "image", label: "Image", icon: <Image size={14} />, defaultData: { url: "", alt: "", caption: "", credit: "", alignment: "full", size: "large" } },
  { type: "imageGallery", label: "Gallery", icon: <LayoutGrid size={14} />, defaultData: { items: [], caption: "" } },
  { type: "video", label: "Video", icon: <Video size={14} />, defaultData: { url: "", caption: "", posterUrl: "" } },
  { type: "divider", label: "Divider", icon: <Minus size={14} />, defaultData: {} },
  { type: "pullQuote", label: "Pull Quote", icon: <Quote size={14} />, defaultData: { text: "", attribution: "" } },
  { type: "bulletList", label: "Bullet List", icon: <List size={14} />, defaultData: { items: [""] } },
  { type: "numberedList", label: "Numbered List", icon: <ListOrdered size={14} />, defaultData: { items: [""] } },
  { type: "table", label: "Table", icon: <Table size={14} />, defaultData: { rows: [["", ""]], header: [] } },
  { type: "embed", label: "Embed", icon: <Link2 size={14} />, defaultData: { url: "", caption: "" } },
  { type: "relatedArticle", label: "Related Article", icon: <FileText size={14} />, defaultData: { url: "", title: "" } },
  { type: "callout", label: "Callout Box", icon: <AlertCircle size={14} />, defaultData: { text: "", title: "", variant: "info" } },
];

function BlockSettings({ block, onUpdate }: { block: ContentBlock; onUpdate: (data: Record<string, unknown>) => void }) {
  const data = block.data;

  const set = (key: string, value: unknown) => {
    onUpdate({ ...data, [key]: value });
  };

  switch (block.type) {
    case "paragraph":
      return (
        <textarea
          value={String(data.text ?? "")}
          onChange={(e) => set("text", e.target.value)}
          placeholder="Type your paragraph..."
          rows={3}
          className="w-full rounded-sm border border-dnews-border bg-dnews-bg p-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
        />
      );

    case "heading":
      return (
        <div className="space-y-2">
          <select
            value={String(data.level ?? "h2")}
            onChange={(e) => set("level", e.target.value)}
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark outline-none"
          >
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>
          <input
            type="text"
            value={String(data.text ?? "")}
            onChange={(e) => set("text", e.target.value)}
            placeholder="Heading text..."
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-sm text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
        </div>
      );

    case "quote":
    case "pullQuote":
      return (
        <div className="space-y-2">
          <textarea
            value={String(data.text ?? "")}
            onChange={(e) => set("text", e.target.value)}
            placeholder="Quote text..."
            rows={2}
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg p-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
          <input
            type="text"
            value={String(data.attribution ?? "")}
            onChange={(e) => set("attribution", e.target.value)}
            placeholder="Attribution (optional)"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={String(data.url ?? "")}
            onChange={(e) => set("url", e.target.value)}
            placeholder="Image URL"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
          <input
            type="text"
            value={String(data.alt ?? "")}
            onChange={(e) => set("alt", e.target.value)}
            placeholder="Alt text"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={String(data.caption ?? "")}
              onChange={(e) => set("caption", e.target.value)}
              placeholder="Caption"
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
            />
            <input
              type="text"
              value={String(data.credit ?? "")}
              onChange={(e) => set("credit", e.target.value)}
              placeholder="Credit"
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={String(data.alignment ?? "full")}
              onChange={(e) => set("alignment", e.target.value)}
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark outline-none"
            >
              <option value="full">Full Width</option>
              <option value="left">Float Left</option>
              <option value="center">Center</option>
              <option value="right">Float Right</option>
            </select>
            <select
              value={String(data.size ?? "large")}
              onChange={(e) => set("size", e.target.value)}
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark outline-none"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="fullWidth">Full Width</option>
            </select>
          </div>
        </div>
      );

    case "video":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={String(data.url ?? "")}
            onChange={(e) => set("url", e.target.value)}
            placeholder="Video URL (YouTube or direct)"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
          <input
            type="text"
            value={String(data.caption ?? "")}
            onChange={(e) => set("caption", e.target.value)}
            placeholder="Caption"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
        </div>
      );

    case "bulletList":
    case "numberedList": {
      const items = (data.items as string[]) ?? [];
      return (
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex gap-1">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value;
                  set("items", next);
                }}
                placeholder={`Item ${i + 1}`}
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
              />
              <button
                type="button"
                onClick={() => set("items", items.filter((_, j) => j !== i))}
                className="rounded-sm p-1 text-dnews-muted hover:text-dnews-red"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("items", [...items, ""])}
            className="text-xs text-dnews-accent hover:underline"
          >
            + Add item
          </button>
        </div>
      );
    }

    case "table": {
      const rows = (data.rows as string[][]) ?? [];
      const header = (data.header as string[]) ?? [];
      return (
        <div className="space-y-2">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase text-dnews-muted">Header Row</p>
            <div className="flex gap-1">
              {header.map((h, i) => (
                <input
                  key={i}
                  type="text"
                  value={h}
                  onChange={(e) => {
                    const next = [...header];
                    next[i] = e.target.value;
                    set("header", next);
                  }}
                  placeholder={`Column ${i + 1}`}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
                />
              ))}
              <button
                type="button"
                onClick={() => set("header", [...header, ""])}
                className="text-xs text-dnews-accent hover:underline"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase text-dnews-muted">Rows</p>
            {rows.map((row, ri) => (
              <div key={ri} className="mb-1 flex gap-1">
                {row.map((cell, ci) => (
                  <input
                    key={ci}
                    type="text"
                    value={cell}
                    onChange={(e) => {
                      const next = rows.map((r) => [...r]);
                      next[ri][ci] = e.target.value;
                      set("rows", next);
                    }}
                    placeholder={`R${ri + 1}C${ci + 1}`}
                    className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => set("rows", rows.filter((_, j) => j !== ri))}
                  className="rounded-sm p-1 text-dnews-muted hover:text-dnews-red"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const cols = header.length || (rows[0]?.length ?? 2);
                set("rows", [...rows, Array(cols).fill("")]);
              }}
              className="text-xs text-dnews-accent hover:underline"
            >
              + Add row
            </button>
          </div>
        </div>
      );
    }

    case "embed":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={String(data.url ?? "")}
            onChange={(e) => set("url", e.target.value)}
            placeholder="Embed URL"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
          <input
            type="text"
            value={String(data.caption ?? "")}
            onChange={(e) => set("caption", e.target.value)}
            placeholder="Caption (optional)"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
        </div>
      );

    case "relatedArticle":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={String(data.url ?? "")}
            onChange={(e) => set("url", e.target.value)}
            placeholder="Article URL"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
          <input
            type="text"
            value={String(data.title ?? "")}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Article title"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
        </div>
      );

    case "callout":
      return (
        <div className="space-y-2">
          <select
            value={String(data.variant ?? "info")}
            onChange={(e) => set("variant", e.target.value)}
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark outline-none"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="tip">Tip</option>
            <option value="quote">Quote</option>
          </select>
          <input
            type="text"
            value={String(data.title ?? "")}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Title (optional)"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
          <textarea
            value={String(data.text ?? "")}
            onChange={(e) => set("text", e.target.value)}
            placeholder="Callout text..."
            rows={2}
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg p-2 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
        </div>
      );

    case "imageGallery": {
      const items = (data.items as Array<{ url: string; caption?: string; credit?: string; alt?: string }>) ?? [];
      return (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="rounded-sm border border-dnews-border bg-dnews-bg p-2">
              <input
                type="text"
                value={item.url}
                onChange={(e) => {
                  const next = items.map((it) => ({ ...it }));
                  next[i] = { ...next[i], url: e.target.value };
                  set("items", next);
                }}
                placeholder="Image URL"
                className="mb-1 w-full rounded-sm border border-dnews-border bg-dnews-card px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
              />
              <input
                type="text"
                value={item.caption ?? ""}
                onChange={(e) => {
                  const next = items.map((it) => ({ ...it }));
                  next[i] = { ...next[i], caption: e.target.value };
                  set("items", next);
                }}
                placeholder="Caption"
                className="mb-1 w-full rounded-sm border border-dnews-border bg-dnews-card px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
              />
              <div className="flex gap-1">
                <input
                  type="text"
                  value={item.credit ?? ""}
                  onChange={(e) => {
                    const next = items.map((it) => ({ ...it }));
                    next[i] = { ...next[i], credit: e.target.value };
                    set("items", next);
                  }}
                  placeholder="Credit"
                  className="w-full rounded-sm border border-dnews-border bg-dnews-card px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
                />
                <button
                  type="button"
                  onClick={() => set("items", items.filter((_, j) => j !== i))}
                  className="rounded-sm p-1 text-dnews-muted hover:text-dnews-red"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("items", [...items, { url: "", caption: "", credit: "", alt: "" }])}
            className="text-xs text-dnews-accent hover:underline"
          >
            + Add image
          </button>
          <input
            type="text"
            value={String(data.caption ?? "")}
            onChange={(e) => set("caption", e.target.value)}
            placeholder="Gallery caption (optional)"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
        </div>
      );
    }

    case "divider":
      return <p className="text-xs text-dnews-muted">No settings needed for dividers.</p>;

    default:
      return null;
  }
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const historyRef = useRef<ContentBlock[][]>([deepClone(blocks)]);
  const historyIndexRef = useRef(0);
  const ignoreNextChangeRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncUndoRedo = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const pushHistory = useCallback((newBlocks: ContentBlock[]) => {
    const history = historyRef.current;
    const idx = historyIndexRef.current;
    const trimmed = history.slice(0, idx + 1);
    trimmed.push(deepClone(newBlocks));
    if (trimmed.length > MAX_HISTORY) trimmed.shift();
    historyRef.current = trimmed;
    historyIndexRef.current = trimmed.length - 1;
    syncUndoRedo();
  }, [syncUndoRedo]);

  const handleChange = useCallback((newBlocks: ContentBlock[]) => {
    if (ignoreNextChangeRef.current) {
      ignoreNextChangeRef.current = false;
    } else {
      pushHistory(newBlocks);
    }
    onChange(newBlocks);
  }, [onChange, pushHistory]);

  const moveBlock = useCallback((from: number, to: number) => {
    const next = deepClone(blocks);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    handleChange(next);
  }, [blocks, handleChange]);

  const removeBlock = useCallback((index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    handleChange(next);
    setEditingIndex(null);
  }, [blocks, handleChange]);

  const addBlock = useCallback((type: ContentBlockType) => {
    const tmpl = BLOCK_TEMPLATES.find((t) => t.type === type);
    const block = createBlock(type, tmpl?.defaultData ?? {});
    const next = [...blocks, block];
    handleChange(next);
    setShowAddMenu(false);
    setEditingIndex(blocks.length);
  }, [blocks, handleChange]);

  const updateBlock = useCallback((index: number, data: Record<string, unknown>) => {
    const next = blocks.map((b, i) => (i === index ? { ...b, data: { ...b.data, ...data } } : b));
    handleChange(next);
  }, [blocks, handleChange]);

  const undo = useCallback(() => {
    const history = historyRef.current;
    const idx = historyIndexRef.current;
    if (idx <= 0) return;
    const newIdx = idx - 1;
    historyIndexRef.current = newIdx;
    ignoreNextChangeRef.current = true;
    onChange(deepClone(history[newIdx]));
    syncUndoRedo();
  }, [onChange, syncUndoRedo]);

  const redo = useCallback(() => {
    const history = historyRef.current;
    const idx = historyIndexRef.current;
    if (idx >= history.length - 1) return;
    const newIdx = idx + 1;
    historyIndexRef.current = newIdx;
    ignoreNextChangeRef.current = true;
    onChange(deepClone(history[newIdx]));
    syncUndoRedo();
  }, [onChange, syncUndoRedo]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="space-y-3">
      {blocks.length > 0 && (
        <div className="flex items-center gap-1 border-b border-dnews-border pb-2">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="rounded-sm p-1.5 text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-dark disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="rounded-sm p-1.5 text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-dark disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={14} />
          </button>
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.id} className="group rounded-sm border border-dnews-border bg-dnews-card">
          <div className="flex items-center gap-1 border-b border-dnews-border bg-dnews-bg px-2 py-1">
            <button
              type="button"
              className="cursor-grab text-dnews-muted hover:text-dnews-dark"
              onMouseDown={(e) => {
                const target = e.currentTarget.parentElement?.parentElement;
                if (!target) return;
                const rect = target.getBoundingClientRect();
                const startY = e.clientY;
                let currentIndex = index;

                const onMove = (me: MouseEvent) => {
                  const delta = me.clientY - startY;
                  const moveBy = Math.round(delta / rect.height);
                  const newIndex = Math.max(0, Math.min(blocks.length - 1, index + moveBy));
                  if (newIndex !== currentIndex) {
                    moveBlock(currentIndex, newIndex);
                    currentIndex = newIndex;
                  }
                };

                const onUp = () => {
                  document.removeEventListener("mousemove", onMove);
                  document.removeEventListener("mouseup", onUp);
                };

                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
                e.preventDefault();
              }}
            >
              <GripVertical size={14} />
            </button>
            <span className="text-[10px] font-medium uppercase text-dnews-muted">{block.type}</span>
            <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => index > 0 && moveBlock(index, index - 1)}
                disabled={index === 0}
                className="rounded-sm p-1 text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-dark disabled:opacity-30"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => index < blocks.length - 1 && moveBlock(index, index + 1)}
                disabled={index === blocks.length - 1}
                className="rounded-sm p-1 text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-dark disabled:opacity-30"
              >
                <ChevronDown size={12} />
              </button>
              <button
                type="button"
                onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                className="rounded-sm p-1 text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-dark"
              >
                <Type size={12} />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(index)}
                className="rounded-sm p-1 text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-red"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          <div className="px-4 py-3">
            {editingIndex === index ? (
              <BlockSettings
                block={block}
                onUpdate={(data) => updateBlock(index, data)}
              />
            ) : (
              <BlockRenderer block={block} />
            )}
          </div>
        </div>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-dashed border-dnews-border py-3 text-xs font-medium text-dnews-muted transition-colors hover:border-dnews-accent hover:text-dnews-accent"
        >
          <Plus size={16} />
          Add Block
        </button>

        {showAddMenu && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-sm border border-dnews-border bg-dnews-card shadow-lg">
            <div className="grid grid-cols-2 gap-1 p-2">
              {BLOCK_TEMPLATES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => addBlock(t.type)}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs text-dnews-dark transition-colors hover:bg-dnews-light-gray"
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
