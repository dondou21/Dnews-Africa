"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { AlertTriangle, ArrowLeftRight, TextSelect, Pilcrow, Maximize2 } from "lucide-react";
import type { ContentBlock } from "@dnews/types";
import {
  deserializeContent, serializeContent, isContentBlocks,
  plainTextToBlocks, blocksToPlainText, htmlToBlocks, blocksToHtml
} from "@dnews/types";
import BlocksEditor from "./blocks/BlockEditor";
import RichTextEditor, { isRichTextContent } from "./RichTextEditor";
import FullScreenEditor from "./FullScreenEditor";

type EditorMode = "blocks" | "richtext" | "plain";

const MODE_LABELS: Record<EditorMode, string> = {
  blocks: "Block Editor",
  richtext: "Rich Text",
  plain: "Plain Text",
};

function detectMode(content: string): EditorMode {
  if (isContentBlocks(content)) return "blocks";
  if (isRichTextContent(content)) return "richtext";
  if (!content.trim()) return "richtext";
  return "plain";
}

interface ArticleBlockEditorProps {
  content: string;
  onChange: (json: string) => void;
}

export default function ArticleBlockEditor({ content, onChange }: ArticleBlockEditorProps) {
  const [mode, setMode] = useState<EditorMode>(() => detectMode(content));
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => deserializeContent(content));
  const [richHtml, setRichHtml] = useState(() => {
    if (isRichTextContent(content)) return content;
    return "";
  });
  const [plainText, setPlainText] = useState(() => {
    if (isContentBlocks(content)) return blocksToPlainText(deserializeContent(content)).text;
    if (isRichTextContent(content)) return "";
    return content;
  });
  const [warnings, setWarnings] = useState<{ mode: EditorMode; messages: string[] } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const warningsTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showTemporaryWarnings = useCallback((targetMode: EditorMode, messages: string[]) => {
    if (warningsTimeoutRef.current) clearTimeout(warningsTimeoutRef.current);
    setWarnings({ mode: targetMode, messages });
    warningsTimeoutRef.current = setTimeout(() => setWarnings(null), 6000);
  }, []);

  const cycleMode = useCallback(() => {
    const order: EditorMode[] = ["richtext", "blocks", "plain"];
    const next = order[(order.indexOf(mode) + 1) % order.length];

    if (mode === "richtext") {
      const { blocks: newBlocks, warnings: convWarnings } = htmlToBlocks(richHtml);
      setBlocks(newBlocks);
      setPlainText(blocksToPlainText(newBlocks).text);
      if (next === "blocks" && convWarnings.length > 0) {
        showTemporaryWarnings("blocks", [
          `Converted ${newBlocks.length} block(s) from rich text.`,
          ...convWarnings.map((w) => `Note: ${w.message}`),
        ]);
      }
    } else if (mode === "blocks") {
      const { text, warnings: convWarnings } = blocksToPlainText(blocks);
      setPlainText(text);
      setRichHtml(blocksToHtml(blocks));
      if (next === "plain" && convWarnings.length > 0) {
        showTemporaryWarnings("plain", [
          `Converted ${blocks.length} block(s) to plain text.`,
          ...convWarnings.map((w) => `⚠ ${w.message} was replaced with a placeholder`),
        ]);
      }
    } else {
      const { blocks: newBlocks, warnings: convWarnings } = plainTextToBlocks(plainText);
      setBlocks(newBlocks);
      setRichHtml(blocksToHtml(newBlocks));
      if (next === "blocks" && convWarnings.length > 0) {
        showTemporaryWarnings("blocks", [
          `Converted ${newBlocks.length} block(s) from plain text.`,
          ...convWarnings.map((w) => `Note: ${w.message}`),
        ]);
      }
    }
    setMode(next);
  }, [mode, blocks, richHtml, plainText, showTemporaryWarnings]);

  const handleBlocksChange = useCallback((newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
  }, []);

  const handleRichTextChange = useCallback((html: string) => {
    setRichHtml(html);
  }, []);

  const handlePlainTextChange = useCallback((val: string) => {
    setPlainText(val);
  }, []);

  useEffect(() => {
    if (mode === "blocks") {
      onChange(serializeContent(blocks));
    } else if (mode === "richtext") {
      onChange(richHtml);
    } else {
      onChange(plainText);
    }
  }, [blocks, richHtml, plainText, mode, onChange]);

  const warningsBanner = useMemo(() => {
    if (!warnings) return null;
    return (
      <div className="rounded-sm border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            {warnings.messages.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }, [warnings]);

  const modeIcons: Record<EditorMode, React.ReactNode> = {
    blocks: <TextSelect size={12} />,
    richtext: <Pilcrow size={12} />,
    plain: <ArrowLeftRight size={12} />,
  };

  const renderModeEditor = (fullscreen: boolean) => {
    if (mode === "blocks") {
      return <BlocksEditor blocks={blocks} onChange={handleBlocksChange} />;
    }
    if (mode === "richtext") {
      return <RichTextEditor content={richHtml} onChange={handleRichTextChange} />;
    }
    return (
      <textarea
        value={plainText}
        onChange={(e) => handlePlainTextChange(e.target.value)}
        placeholder="Article body content..."
        required
        rows={fullscreen ? undefined : 12}
        className={`w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent font-mono ${
          fullscreen ? "h-full min-h-[70vh] resize-none" : ""
        }`}
      />
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-dnews-gray">
          {MODE_LABELS[mode]} <span className="text-dnews-red">*</span>
        </label>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            title="Edit in full screen (Ctrl/Cmd + S to save, Esc to close)"
            className="flex items-center gap-1 rounded-sm border border-dnews-border px-2 py-1 text-[10px] font-medium text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
          >
            <Maximize2 size={12} />
            Full screen
          </button>
          <button
            type="button"
            onClick={cycleMode}
            className="flex items-center gap-1 rounded-sm border border-dnews-border px-2 py-1 text-[10px] font-medium text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
          >
            {modeIcons[mode]}
            Switch to{" "}
            {mode === "richtext"
              ? "Block Editor"
              : mode === "blocks"
                ? "Plain Text"
                : "Rich Text"}
          </button>
        </div>
      </div>

      {warningsBanner}

      {renderModeEditor(false)}

      <FullScreenEditor
        open={expanded}
        title="Content Editor"
        onClose={() => setExpanded(false)}
        onSave={() => setExpanded(false)}
      >
        {renderModeEditor(true)}
      </FullScreenEditor>
    </div>
  );
}
