import Link from "next/link";
import type { Article } from "@/src/lib/articles";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group border-b border-dnews-border pb-5">
      <Link href={`/articles/${article.slug}`}>
        <div className="mb-3 aspect-[16/9] w-full bg-dnews-light-gray flex items-center justify-center text-dnews-muted text-sm transition-colors group-hover:bg-dnews-border">
          Image Placeholder
        </div>
      </Link>
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
      <p className="mt-1 text-sm leading-relaxed text-dnews-gray line-clamp-2">
        {article.excerpt}
      </p>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-dnews-muted">
        <span className="font-medium text-dnews-dark">{article.authorName}</span>
        <span>·</span>
        <span>{article.publishedAt}</span>
        <span>·</span>
        <span>{article.readTime}</span>
      </div>
    </article>
  );
}
