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

export interface ImageBlockData {
  url: string;
  caption: string;
  credit: string;
  alt: string;
  alignment: ImageAlignment;
  size: ImageSize;
  mediaId?: string;
}

export interface ImageGalleryItem {
  url: string;
  caption: string;
  credit: string;
  alt: string;
  mediaId?: string;
}

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  data: Record<string, unknown>;
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
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.length > 0 && "type" in parsed[0] && "id" in parsed[0];
  } catch {
    return false;
  }
}
