const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "http://localhost:4000/uploads";

export const FALLBACK_IMAGE = "/images/placeholder-news.svg";

function stripLeadingSlash(url: string): string {
  return url.replace(/^\//, "");
}

export function resolveImageUrl(
  url: string | null | undefined,
  fallback: string = FALLBACK_IMAGE
): string {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("blob:")) return url;
  if (url.startsWith("/uploads/")) {
    return `${MEDIA_BASE_URL}/${stripLeadingSlash(url.replace("/uploads", ""))}`;
  }
  return `${MEDIA_BASE_URL}/${stripLeadingSlash(url)}`;
}

export function getFeaturedImageUrl(
  featuredImage: { url: string } | null | undefined,
  coverImageUrl: string | null | undefined,
  fallback: string = FALLBACK_IMAGE
): string {
  if (featuredImage?.url) return resolveImageUrl(featuredImage.url, fallback);
  if (coverImageUrl) return resolveImageUrl(coverImageUrl, fallback);
  return fallback;
}
