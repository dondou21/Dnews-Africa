import Image from "next/image";
import Link from "next/link";
import { FALLBACK_IMAGE } from "@/lib/image";
import type { Article } from "@/src/data/articles";

export default function HeroArticle({ article }: { article: Article }) {
  return (
    <article className="group mb-8 border-b border-dnews-border pb-6">
      <Link href={`/articles/${article.slug}`}>
        <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden bg-dnews-light-gray">
          <Image
            src={article.imageUrl || FALLBACK_IMAGE}
            alt={article.imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 640px"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_IMAGE;
            }}
          />
        </div>
        <div>
          <span className="mb-2 inline-block rounded bg-dnews-red px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
            {article.category}
          </span>
          <h2 className="font-heading mt-2 text-xl font-bold leading-tight text-dnews-dark md:text-2xl">
            {article.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-dnews-gray">
            {article.excerpt}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-dnews-muted">
            <span className="font-medium text-dnews-dark">
              By {article.authorName}
            </span>
            <span>·</span>
            <span>{article.publishedAt}</span>
            <span>·</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
