import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/src/lib/articles";

export default function HeroArticle({ article }: { article: Article }) {
  return (
    <article className="group mb-8 border-b border-dnews-border pb-6">
      <Link href={`/articles/${article.slug}`} className="relative mb-4 block overflow-hidden">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={article.imageUrl}
            alt={article.imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 640px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <span className="mb-2 inline-block rounded bg-dnews-red px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
              {article.category}
            </span>
            <h2 className="font-heading text-xl font-bold leading-tight text-white md:text-2xl">
              {article.title}
            </h2>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-200">
              {article.excerpt}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-300">
              <span className="font-medium text-white">
                By {article.authorName}
              </span>
              <span>·</span>
              <span>{article.publishedAt}</span>
              <span>·</span>
              <span>{article.readTime}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
