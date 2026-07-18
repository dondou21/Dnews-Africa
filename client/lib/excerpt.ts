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

function getArticleText(
  summary: string | null | undefined,
  content: string | null | undefined
): string {
  if (summary?.trim()) return summary.trim();
  if (!content?.trim()) return "";
  return extractFromBlocks(content) || extractFromPlainText(content) || "";
}

export function extractExcerpt(
  summary: string | null | undefined,
  content: string | null | undefined,
  maxChars = 280
): string {
  const text = getArticleText(summary, content);
  if (!text) return "";
  return truncateText(text, maxChars);
}

export function extractFirstSentence(
  summary: string | null | undefined,
  content: string | null | undefined,
  maxFallbackChars = 220
): string {
  const text = getArticleText(summary, content);
  if (!text) return "";

  const match = text.match(/^(.*?[.!?])(?:\s|$)/);
  if (match) {
    let sentence = match[1].trim();
    if (sentence.length < 20) {
      const rest = text.slice(match[0].length).trim();
      const secondMatch = rest.match(/^(.*?[.!?])(?:\s|$)/);
      if (secondMatch) {
        sentence += " " + secondMatch[1].trim();
      }
    }
    return sentence;
  }

  if (text.length <= maxFallbackChars) return text;
  const truncated = text.slice(0, maxFallbackChars);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxFallbackChars * 0.7) {
    return truncated.slice(0, lastSpace) + "...";
  }
  return truncated + "...";
}
