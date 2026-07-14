import Image from "@/components/shared/AppImage";
import Link from "next/link";
import { getFeaturedImageUrl, FALLBACK_IMAGE } from "@/lib/image";

interface ArticleItem {
  slug: string;
  title: string;
  summary: string;
  category: { id: number; name: string; slug: string };
  author: { firstName: string; lastName: string };
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage?: { url: string; alt: string | null } | null;
  publishedAt: string | null;
  createdAt: string;
}

function getCategoryColor(categoryName: string): "red" | "blue" {
  const sportsCulture = ["sports", "culture", "youth", "featured"];
  return sportsCulture.some((c) => categoryName.toLowerCase().includes(c))
    ? "red"
    : "blue";
}

export default function ArticleListItem({ article }: { article: ArticleItem }) {
  const colorClass =
    getCategoryColor(article.category.name) === "red"
      ? "text-dnews-red"
      : "text-dnews-accent";

  const imgSrc = getFeaturedImageUrl(article.featuredImage, article.coverImageUrl);
  const imgAlt = article.featuredImage?.alt || article.coverImageAlt || "";

  return (
    <article className="flex gap-4 border-b border-dnews-border pb-4">
      <Link
        href={`/articles/${article.slug}`}
        className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm bg-dnews-light-gray"
      >
        {imgSrc && (
          <Image
            src={imgSrc}
            alt={imgAlt}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            sizes="96px"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className={`mb-1 text-[11px] font-semibold uppercase tracking-wider ${colorClass}`}>
          {article.category.name}
        </div>
        <h3 className="font-heading text-base font-bold leading-snug text-dnews-dark">
          <Link
            href={`/articles/${article.slug}`}
            className="transition-colors hover:text-dnews-accent"
          >
            {article.title}
          </Link>
        </h3>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-dnews-muted">
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
          <span>·</span>
          <span>{article.author.firstName} {article.author.lastName}</span>
        </div>
      </div>
    </article>
  );
}
