"use client";

import { useState, useEffect } from "react";
import type { ContentBlock } from "@/types/contentBlocks";
import { deserializeContent, serializeContent, isContentBlocks } from "@/types/contentBlocks";
import BlocksEditor from "./blocks/BlockEditor";

interface ArticleBlockEditorProps {
  content: string;
  onChange: (json: string) => void;
}

export default function ArticleBlockEditor({ content, onChange }: ArticleBlockEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => deserializeContent(content));
  const [useBlocks, setUseBlocks] = useState(() => isContentBlocks(content));

  useEffect(() => {
    if (useBlocks) {
      onChange(serializeContent(blocks));
    }
  }, [blocks, useBlocks, onChange]);

  const handleBlocksChange = (newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks);
  };

  if (!useBlocks) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-dnews-gray">
            Content <span className="text-dnews-red">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              setUseBlocks(true);
              if (content.trim()) {
                const existingBlocks: ContentBlock[] = content
                  .split("\n\n")
                  .filter(Boolean)
                  .map((text) => ({
                    id: "blk_" + Math.random().toString(36).substring(2, 11),
                    type: "paragraph" as const,
                    data: { text },
                  }));
                setBlocks(existingBlocks);
              } else {
                setBlocks([{
                  id: "blk_" + Math.random().toString(36).substring(2, 11),
                  type: "paragraph",
                  data: { text: "" },
                }]);
              }
            }}
            className="rounded-sm border border-dnews-border px-2 py-1 text-[10px] font-medium text-dnews-accent hover:bg-dnews-light-gray"
          >
            Switch to Block Editor
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Article body content..."
          required
          rows={12}
          className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent font-mono"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-dnews-gray">
          Content Blocks <span className="text-dnews-red">*</span>
        </label>
        <button
          type="button"
          onClick={() => setUseBlocks(false)}
          className="rounded-sm border border-dnews-border px-2 py-1 text-[10px] font-medium text-dnews-muted hover:bg-dnews-light-gray"
        >
          Switch to Plain Text
        </button>
      </div>
      <BlocksEditor blocks={blocks} onChange={handleBlocksChange} />
      <input type="hidden" value={serializeContent(blocks)} />
    </div>
  );
}
