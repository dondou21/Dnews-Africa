import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/src/lib/articles";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group overflow-hidden rounded-sm border border-dnews-border bg-dnews-card transition-shadow hover:shadow-md">
      <Link href={`/articles/${article.slug}`}>
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={article.imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
          {article.category}
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
          {article.excerpt}
        </p>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-dnews-muted">
          <span className="font-medium text-dnews-dark">{article.authorName}</span>
          <span>·</span>
          <span>{article.publishedAt}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </article>
  );
}
