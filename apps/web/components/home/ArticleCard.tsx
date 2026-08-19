import ArticleImage from "@/components/shared/ArticleImage";
import Link from "next/link";
import { getFeaturedImageUrl } from "@/lib/image";
import { extractExcerpt, extractFirstSentence } from "@/lib/excerpt";

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
  category: { id: number; name: string; slug: string; parentId: number | null; parent: { id: number; name: string; slug: string } | null };
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
  const sentence = extractFirstSentence(article.summary, article.content);
  const excerpt = extractExcerpt(article.summary, article.content);
  const authorDisplay = article.authorName || `${article.author?.firstName || ""} ${article.author?.lastName || ""}`.trim();

  if (variant === "hero") {
    return (
      <article className="group border-b border-dnews-border pb-6">
        <Link href={`/articles/${article.slug}`}>
          <div className="overflow-hidden rounded-xl">
            <ArticleImage
              src={imgSrc}
              alt={imgAlt}
              layout="hero"
              priority={priority}
              containerClassName="mb-5 transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
          <div>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
              {article.category?.parent ? `${article.category.parent.name} / ${article.category.name}` : article.category?.name || ""}
            </span>
            <h2 className="font-heading mt-2 text-xl font-bold leading-tight text-dnews-dark transition-colors group-hover:text-dnews-accent md:text-2xl lg:text-3xl">
              {article.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
              {sentence || excerpt}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-dnews-muted">
              <span className="font-medium text-dnews-dark">
                By {authorDisplay}
              </span>
              <span className="text-dnews-border">·</span>
              <span>{formatDate(article.publishedAt)}</span>
              <span className="text-dnews-border">·</span>
              <span className="inline-flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {estimateReadingTime(article.content || article.summary)} min read
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link href={`/articles/${article.slug}`}>
        <span className="mb-1.5 inline-block text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
          {article.category?.parent ? `${article.category.parent.name} / ${article.category.name}` : article.category?.name || ""}
        </span>
        <h3 className="font-heading mb-3 text-lg font-bold leading-snug text-dnews-dark transition-colors group-hover:text-dnews-accent md:text-xl">
          {article.title}
        </h3>
        <div className="overflow-hidden rounded-xl">
          <ArticleImage
            src={imgSrc}
            alt={imgAlt}
            layout="card"
            priority={priority}
            containerClassName="mb-3 transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-dnews-gray">
          {sentence || excerpt}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-dnews-muted">
          <span className="font-medium text-dnews-dark">{authorDisplay}</span>
          <span className="text-dnews-border">·</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span className="text-dnews-border">·</span>
          <span className="inline-flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {estimateReadingTime(article.content || article.summary)} min read
          </span>
        </div>
      </Link>
    </article>
  );
}
