"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { AlertTriangle, ArrowLeftRight } from "lucide-react";
import type { ContentBlock } from "@/types/contentBlocks";
import {
  deserializeContent, serializeContent, isContentBlocks,
  plainTextToBlocks, blocksToPlainText
} from "@/types/contentBlocks";
import BlocksEditor from "./blocks/BlockEditor";

interface ArticleBlockEditorProps {
  content: string;
  onChange: (json: string) => void;
}

export default function ArticleBlockEditor({ content, onChange }: ArticleBlockEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => deserializeContent(content));
  const [useBlocks, setUseBlocks] = useState(() => isContentBlocks(content));
  const [plainText, setPlainText] = useState(() => {
    if (isContentBlocks(content)) {
      return blocksToPlainText(deserializeContent(content)).text;
    }
    return content;
  });
  const [warnings, setWarnings] = useState<{ mode: "blocks" | "plain"; messages: string[] } | null>(null);
  const warningsTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showTemporaryWarnings = useCallback((mode: "blocks" | "plain", messages: string[]) => {
    if (warningsTimeoutRef.current) clearTimeout(warningsTimeoutRef.current);
    setWarnings({ mode, messages });
    warningsTimeoutRef.current = setTimeout(() => setWarnings(null), 6000);
  }, []);

  const switchToBlocks = useCallback(() => {
    const { blocks: newBlocks, warnings: convWarnings } = plainTextToBlocks(plainText);
    setBlocks(newBlocks);
    setUseBlocks(true);
    if (convWarnings.length > 0) {
      showTemporaryWarnings("blocks", [
        `Converted ${newBlocks.length} block(s) from plain text.`,
        ...convWarnings.map((w) => `Note: ${w.message}`),
      ]);
    }
  }, [plainText, showTemporaryWarnings]);

  const switchToPlain = useCallback(() => {
    const { text, warnings: convWarnings } = blocksToPlainText(blocks);
    setPlainText(text);
    setUseBlocks(false);
    if (convWarnings.length > 0) {
      showTemporaryWarnings("plain", [
        `Converted ${blocks.length} block(s) to plain text.`,
        ...convWarnings.map((w) => `⚠ ${w.message} was replaced with a placeholder`),
      ]);
    }
  }, [blocks, showTemporaryWarnings]);

  const handleBlocksChange = useCallback((newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
  }, []);

  const handlePlainTextChange = useCallback((val: string) => {
    setPlainText(val);
  }, []);

  useEffect(() => {
    if (useBlocks) {
      onChange(serializeContent(blocks));
    } else {
      onChange(plainText);
    }
  }, [blocks, plainText, useBlocks, onChange]);

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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-dnews-gray">
          {useBlocks ? "Content Blocks" : "Content"} <span className="text-dnews-red">*</span>
        </label>
        <button
          type="button"
          onClick={useBlocks ? switchToPlain : switchToBlocks}
          className="flex items-center gap-1 rounded-sm border border-dnews-border px-2 py-1 text-[10px] font-medium text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
        >
          <ArrowLeftRight size={12} />
          Switch to {useBlocks ? "Plain Text" : "Block Editor"}
        </button>
      </div>

      {warningsBanner}

      {useBlocks ? (
        <BlocksEditor blocks={blocks} onChange={handleBlocksChange} />
      ) : (
        <textarea
          value={plainText}
          onChange={(e) => handlePlainTextChange(e.target.value)}
          placeholder="Article body content..."
          required
          rows={12}
          className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent font-mono"
        />
      )}
    </div>
  );
}
