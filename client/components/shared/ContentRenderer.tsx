"use client";

import { useMemo } from "react";
import { deserializeContent, isContentBlocks } from "@/types/contentBlocks";
import BlockRenderer from "@/components/dashboard/blocks/BlockRenderer";

interface ContentRendererProps {
  content: string;
}

export default function ContentRenderer({ content }: ContentRendererProps) {
  const blocks = useMemo(() => deserializeContent(content), [content]);
  const isBlocks = useMemo(() => isContentBlocks(content), [content]);

  if (isBlocks) {
    return (
      <>
        {blocks.map((block) => (
          <div key={block.id} className="content-block">
            <BlockRenderer block={block} />
          </div>
        ))}
      </>
    );
  }

  if (!content) return null;

  return (
    <>
      {content.split("\n\n").map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </>
  );
}
