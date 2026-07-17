export type ContentBlockType =
  | "paragraph"
  | "heading"
  | "quote"
  | "image"
  | "imageGallery"
  | "video"
  | "divider"
  | "pullQuote"
  | "bulletList"
  | "numberedList"
  | "table"
  | "embed"
  | "relatedArticle"
  | "callout";

export type HeadingLevel = "h2" | "h3" | "h4";
export type ImageAlignment = "full" | "left" | "center" | "right";
export type ImageSize = "small" | "medium" | "large" | "fullWidth";
export type CalloutVariant = "info" | "warning" | "tip" | "quote";

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  data: Record<string, unknown>;
}

export interface ConversionWarning {
  blockId: string;
  type: ContentBlockType;
  message: string;
}

export function createBlockId(): string {
  return "blk_" + Math.random().toString(36).substring(2, 11);
}

export function createBlock(type: ContentBlockType, data?: Record<string, unknown>): ContentBlock {
  return { id: createBlockId(), type, data: data ?? {} };
}

export function serializeContent(blocks: ContentBlock[]): string {
  return JSON.stringify(blocks);
}

export function deserializeContent(content: string): ContentBlock[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type && parsed[0].id) {
      return parsed as ContentBlock[];
    }
    return [];
  } catch {
    return [];
  }
}

export function isContentBlocks(content: string): boolean {
  if (!content) return false;
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.length > 0 && "type" in parsed[0] && "id" in parsed[0];
  } catch {
    return false;
  }
}

function detectMarkdownLine(line: string): { type: ContentBlockType; data: Record<string, unknown> } | null {
  const trimmed = line.trim();

  const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const hLevel = level <= 2 ? "h2" : level === 3 ? "h3" : "h4";
    return { type: "heading", data: { text: headingMatch[2], level: hLevel } };
  }

  if (trimmed.startsWith("> ")) {
    const text = trimmed.replace(/^> /, "");
    const parts = text.split("—").map((s) => s.trim());
    if (parts.length > 1) {
      return { type: "quote", data: { text: parts[0], attribution: parts[1] } };
    }
    return { type: "quote", data: { text, attribution: "" } };
  }

  return null;
}

export function plainTextToBlocks(text: string): { blocks: ContentBlock[]; warnings: ConversionWarning[] } {
  const lines = text.split("\n");
  const blocks: ContentBlock[] = [];
  const warnings: ConversionWarning[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (trimmed === "---") {
      blocks.push(createBlock("divider", {}));
      i++;
      continue;
    }

    const md = detectMarkdownLine(line);
    if (md) {
      blocks.push(createBlock(md.type, md.data));
      i++;
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].trimStart().startsWith("- ") || lines[i].trimStart().startsWith("* "))) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(createBlock("bulletList", { items }));
      continue;
    }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push(createBlock("numberedList", { items }));
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      const text = paraLines.map((l) => l.trim()).join("\n");
      blocks.push(createBlock("paragraph", { text }));
    }
  }

  if (blocks.length === 0) {
    blocks.push(createBlock("paragraph", { text: "" }));
  }

  return { blocks, warnings };
}

export function blocksToPlainText(blocks: ContentBlock[]): { text: string; warnings: ConversionWarning[] } {
  const parts: string[] = [];
  const warnings: ConversionWarning[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "paragraph": {
        const pText = String(block.data.text ?? "");
        parts.push(pText);
        parts.push("");
        break;
      }

      case "heading": {
        const level = String(block.data.level ?? "h2");
        const prefix = level === "h2" ? "##" : level === "h3" ? "###" : "####";
        parts.push(`${prefix} ${String(block.data.text ?? "")}`);
        parts.push("");
        break;
      }

      case "quote": {
        const text = String(block.data.text ?? "");
        const attribution = String(block.data.attribution ?? "");
        if (attribution) {
          parts.push(`> ${text} — ${attribution}`);
        } else {
          parts.push(`> ${text}`);
        }
        parts.push("");
        break;
      }

      case "pullQuote": {
        const text = String(block.data.text ?? "");
        const attribution = String(block.data.attribution ?? "");
        parts.push(`> ${text}`);
        if (attribution) parts.push(`> — ${attribution}`);
        parts.push("");
        break;
      }

      case "bulletList": {
        const items = (block.data.items as string[]) ?? [];
        for (const item of items) {
          parts.push(`- ${item}`);
        }
        parts.push("");
        break;
      }

      case "numberedList": {
        const items = (block.data.items as string[]) ?? [];
        items.forEach((item, idx) => {
          parts.push(`${idx + 1}. ${item}`);
        });
        parts.push("");
        break;
      }

      case "divider":
        parts.push("---");
        parts.push("");
        break;

      case "image":
        warnings.push({ blockId: block.id, type: "image", message: `Image: ${block.data.url ?? "(no URL)"}` });
        parts.push(`[Image: ${String(block.data.alt ?? block.data.caption ?? "image")}]`);
        parts.push("");
        break;

      case "imageGallery":
        warnings.push({ blockId: block.id, type: "imageGallery", message: "Image gallery with " + String(((block.data.items as Array<unknown>) ?? []).length) + " images" });
        parts.push(`[Image Gallery: ${String(block.data.caption ?? "gallery")}]`);
        parts.push("");
        break;

      case "video":
        warnings.push({ blockId: block.id, type: "video", message: `Video: ${block.data.url ?? "(no URL)"}` });
        parts.push(`[Video: ${String(block.data.caption ?? "video")}]`);
        parts.push("");
        break;

      case "table":
        warnings.push({ blockId: block.id, type: "table", message: `Table with ${((block.data.rows as Array<unknown>) ?? []).length} rows` });
        parts.push(`[Table]`);
        parts.push("");
        break;

      case "embed":
        warnings.push({ blockId: block.id, type: "embed", message: `Embed: ${block.data.url ?? "(no URL)"}` });
        parts.push(`[Embed: ${String(block.data.caption ?? "embed")}]`);
        parts.push("");
        break;

      case "relatedArticle":
        warnings.push({ blockId: block.id, type: "relatedArticle", message: `Related article: ${block.data.url ?? "(no URL)"}` });
        parts.push(`[Related Article: ${String(block.data.title ?? "link")}]`);
        parts.push("");
        break;

      case "callout":
        parts.push(`[${String((block.data.variant ?? "info")).toUpperCase()}] ${String(block.data.title ?? "")}`);
        parts.push(String(block.data.text ?? ""));
        parts.push("");
        break;

      default:
        parts.push(String(block.data.text ?? ""));
        parts.push("");
    }
  }

  return { text: parts.join("\n").trim(), warnings };
}
