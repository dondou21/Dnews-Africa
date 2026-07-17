function stripMarkdown(text: string): string {
  return text
    .replace(/[*_~`#]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const truncated = text.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxChars * 0.7) {
    return truncated.slice(0, lastSpace) + "...";
  }
  return truncated + "...";
}

function extractFromBlocks(content: string): string | null {
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return null;
    const firstParagraph = parsed.find(
      (b: { type: string }) => b.type === "paragraph" && b.data?.text
    );
    if (firstParagraph) {
      const text = String(firstParagraph.data.text ?? "").trim();
      if (text) return text;
    }
    return null;
  } catch {
    return null;
  }
}

function extractFromPlainText(content: string): string | null {
  const trimmed = content.trim();
  if (!trimmed) return null;
  const paragraphs = trimmed.split(/\n\s*\n/);
  for (const para of paragraphs) {
    const text = stripMarkdown(para.trim());
    if (text) return text;
  }
  return null;
}

export function extractExcerpt(
  summary: string | null | undefined,
  content: string | null | undefined,
  maxChars = 280
): string {
  if (summary?.trim()) {
    return truncateText(summary.trim(), maxChars);
  }

  if (!content?.trim()) return "";

  const fromBlocks = extractFromBlocks(content);
  if (fromBlocks) return truncateText(fromBlocks, maxChars);

  const fromPlain = extractFromPlainText(content);
  if (fromPlain) return truncateText(fromPlain, maxChars);

  return "";
}
