"use client";

import { useMemo } from "react";
import { deserializeContent, isContentBlocks } from "@dnews/types";
import BlockRenderer from "@/components/shared/BlockRenderer";

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

  const paragraphs = content.split("\n\n");
  return (
    <>
      {paragraphs.map((para, i) => {
        if (!para.trim()) return null;
        return (
          <p
            key={i}
            className="mb-6 text-[clamp(1rem,1.2vw,1.125rem)] leading-[1.8] text-dnews-dark last:mb-0"
          >
            {para.split("\n").map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}