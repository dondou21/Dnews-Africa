"use client";

import { useMemo } from "react";
import { deserializeContent, isContentBlocks } from "@dnews/types";
import BlockRenderer from "@/components/shared/BlockRenderer";

const ALLOWED_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "dl", "dt", "dd",
  "blockquote", "pre", "code", "hr", "br",
  "em", "strong", "b", "i", "u", "strike", "s", "sub", "sup", "span",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "colgroup", "col",
  "video", "source", "iframe",
  "div", "aside", "cite",
]);

const ALLOWED_ATTRS = new Set([
  "href", "src", "alt", "title", "width", "height", "class", "style",
  "target", "rel", "controls", "poster", "loading", "id", "name",
  "colspan", "rowspan", "scope", "headers", "lang", "dir",
  "allowfullscreen", "frameborder", "allow", "sandbox",
  "start", "type", "reversed",
]);

function sanitizeHtml(html: string): string {
  return html.replace(/<[^>]*>/g, (tag) => {
    const lower = tag.toLowerCase();
    const tagNameMatch = lower.match(/^<\/(\w+)/) || lower.match(/^<(\w+)/);
    if (!tagNameMatch) return "";
    const tagName = tagNameMatch[1];
    if (!ALLOWED_TAGS.has(tagName)) return "";

    if (tag.startsWith("</")) return `</${tagName}>`;

    const attrs = tag.match(/(\w+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g) || [];
    const safeAttrs: string[] = [];
    for (const attr of attrs) {
      const attrMatch = attr.match(/^(\w+)/);
      if (!attrMatch) continue;
      const attrName = attrMatch[1].toLowerCase();
      if (attrName.startsWith("on")) continue;
      if (attrName === "href" || attrName === "src") {
        const valMatch = attr.match(/=(?:"([^"]*)"|'([^']*)'|(\S+))/);
        const val = valMatch?.[1] || valMatch?.[2] || valMatch?.[3] || "";
        if (val.startsWith("javascript:") || val.startsWith("data:")) continue;
      }
      if (ALLOWED_ATTRS.has(attrName)) {
        safeAttrs.push(attr);
      }
    }
    return `<${tagName}${safeAttrs.length ? " " + safeAttrs.join(" ") : ""}>`;
  });
}

function isHtmlContent(str: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  return trimmed.startsWith("<") && trimmed.endsWith(">") ||
    /<[a-z][\s\S]*?>/i.test(trimmed);
}

interface ContentRendererProps {
  content: string;
}

export default function ContentRenderer({ content }: ContentRendererProps) {
  const blocks = useMemo(() => deserializeContent(content), [content]);
  const isBlocks = useMemo(() => isContentBlocks(content), [content]);
  const isHtml = useMemo(() => isHtmlContent(content) && !isBlocks, [content]);
  const sanitized = useMemo(() => isHtml ? sanitizeHtml(content) : "", [isHtml, content]);

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

  if (isHtml) {
    return (
      <div
        className="article-rich-text"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
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