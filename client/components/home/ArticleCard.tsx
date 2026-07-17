import Image from "@/components/shared/AppImage";
import Link from "next/link";
import { getFeaturedImageUrl, FALLBACK_IMAGE } from "@/lib/image";
import { extractExcerpt } from "@/lib/excerpt";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage: { url: string; alt: string | null } | null;
  publishedAt: string | null;
  createdAt: string;
  category: { id: number; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
  authorName?: string | null;
  authorPosition?: string | null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

interface ArticleCardProps {
  article: ArticleItem;
  variant?: "hero" | "secondary" | "default";
  priority?: boolean;
}

export default function ArticleCard({ article, variant = "default", priority }: ArticleCardProps) {
  const imgSrc = getFeaturedImageUrl(article.featuredImage, article.coverImageUrl);
  const imgAlt = article.featuredImage?.alt || article.coverImageAlt || article.title;
  const excerpt = extractExcerpt(article.summary, article.content);

  if (variant === "hero") {
    return (
      <article className="group border-b border-dnews-border pb-6">
        <Link href={`/articles/${article.slug}`}>
          <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
            <Image
              src={imgSrc}
              alt={imgAlt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 780px"
              priority={priority}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = FALLBACK_IMAGE;
              }}
            />
          </div>
          <div>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
              {article.category?.name || ""}
            </span>
            <h2 className="font-heading mt-2 text-xl font-bold leading-tight text-dnews-dark md:text-2xl lg:text-3xl">
              {article.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-dnews-gray">
              {excerpt}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-dnews-muted">
              <span className="font-medium text-dnews-dark">
                By {article.authorName || `${article.author?.firstName || ""} ${article.author?.lastName || ""}`.trim()}
              </span>
              <span>·</span>
              <span>{formatDate(article.publishedAt)}</span>
              <span>·</span>
              <span>{estimateReadingTime(excerpt || article.summary)} min read</span>
            </div>
            <span className="mt-4 inline-block rounded-sm border border-dnews-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-dnews-gray transition-colors group-hover:border-dnews-accent group-hover:text-dnews-accent">
              Read More →
            </span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link href={`/articles/${article.slug}`}>
        <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
          <Image
            src={imgSrc}
            alt={imgAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={variant === "secondary" ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
            loading={priority ? undefined : "lazy"}
            priority={priority}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_IMAGE;
            }}
          />
        </div>
        <span className="mb-1.5 inline-block text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
          {article.category?.name || ""}
        </span>
        <h3 className="font-heading text-base font-bold leading-snug text-dnews-dark transition-colors group-hover:text-dnews-accent md:text-lg">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-dnews-gray md:line-clamp-3">
          {excerpt}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-dnews-muted">
          <span>{formatDate(article.publishedAt)}</span>
          <span>·</span>
          <span>{estimateReadingTime(excerpt || article.summary)} min read</span>
        </div>
      </Link>
    </article>
  );
}
