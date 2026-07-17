import Image from "@/components/shared/AppImage";
import Link from "next/link";
import { resolveImageUrl, getFeaturedImageUrl, FALLBACK_IMAGE } from "@/lib/image";
import { extractExcerpt } from "@/lib/excerpt";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage?: { url: string; alt: string | null } | null;
  publishedAt: string | null;
  createdAt: string;
  category: { id: number; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
  authorName?: string | null;
  authorPosition?: string | null;
}

export default function ArticleCard({ article }: { article: ArticleItem }) {
  const imgSrc = getFeaturedImageUrl(article.featuredImage, article.coverImageUrl);
  const imgAlt = article.featuredImage?.alt || article.coverImageAlt || article.title;
  const excerpt = extractExcerpt(article.summary, article.content);

  return (
    <article className="group overflow-hidden rounded-sm border border-dnews-border bg-dnews-card transition-shadow hover:shadow-md">
      <Link href={`/articles/${article.slug}`}>
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-dnews-light-gray">
          <Image
            src={imgSrc}
            alt={imgAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_IMAGE;
            }}
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
          {article.category.name}
        </div>
        <h2 className="font-heading text-lg font-bold leading-snug text-dnews-dark">
          <Link
            href={`/articles/${article.slug}`}
            className="transition-colors hover:text-dnews-accent"
          >
            {article.title}
          </Link>
        </h2>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-dnews-gray">
          {excerpt}
        </p>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-dnews-muted">
          <span className="font-medium text-dnews-dark">
            {article.authorName || `${article.author.firstName} ${article.author.lastName}`}
          </span>
          <span>·</span>
          <span>
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : new Date(article.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
          </span>
        </div>
      </div>
    </article>
  );
}
