import Link from "next/link";
import type { Article } from "@/src/data/articles";

export default function HeroArticle({ article }: { article: Article }) {
  return (
    <article className="mb-8 border-b border-dnews-border pb-6">
      <Link href={`/articles/${article.slug}`} className="group">
        <div className="mb-4 aspect-[16/9] w-full bg-dnews-light-gray flex items-center justify-center text-dnews-muted text-sm transition-colors group-hover:bg-dnews-border">
          Hero Image Placeholder
        </div>
      </Link>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
        {article.category}
      </div>
      <h2 className="font-heading text-2xl font-bold leading-tight text-dnews-dark md:text-3xl">
        <Link href={`/articles/${article.slug}`} className="transition-colors hover:text-dnews-accent">
          {article.title}
        </Link>
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
        {article.excerpt}
      </p>
      <div className="mt-3 flex items-center gap-3 text-xs text-dnews-muted">
        <span className="font-medium text-dnews-dark">By {article.authorName}</span>
        <span>{article.publishedAt}</span>
        <span>·</span>
        <span>{article.readTime}</span>
      </div>
    </article>
  );
}
