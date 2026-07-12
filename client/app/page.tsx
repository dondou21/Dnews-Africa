"use client";

import Link from "next/link";
import Image from "next/image";
import RightSidebar from "@/components/home/RightSidebar";
import AdSlot from "@/components/home/AdSlot";
import ArticleListItem from "@/components/home/ArticleListItem";
import { articles, getFeaturedArticle, getTrendingArticles, type Article } from "@/src/data/articles";
import { FALLBACK_IMAGE } from "@/lib/image";

function estimateReadTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function ArticleCard({ article, priority }: { article: Article; priority?: boolean }) {
  return (
    <article className="group">
      <Link href={`/articles/${article.slug}`}>
        <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
          <Image
            src={article.imageUrl || FALLBACK_IMAGE}
            alt={article.imageAlt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={priority}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_IMAGE;
            }}
          />
        </div>
        <span className="mb-1.5 inline-block text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
          {article.category}
        </span>
        <h3 className="font-heading text-base font-bold leading-snug text-dnews-dark transition-colors group-hover:text-dnews-accent">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-dnews-gray">
          {article.excerpt}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-dnews-muted">
          <span className="font-medium text-dnews-dark">By {article.authorName}</span>
          <span>·</span>
          <span>{article.publishedAt}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>
      </Link>
    </article>
  );
}

function SectionArticles({ title, articles }: { title: string; articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <section>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-brand-red">
        {title}
      </h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const featured = getFeaturedArticle();
  const trending = getTrendingArticles();
  const latest = articles.slice(0, 6);
  const newsArticles = articles.filter(a => a.category.includes("News") || a.category === "Youth").slice(0, 3);
  const businessArticles = articles.filter(a => a.category.includes("Business")).slice(0, 3);
  const sportsArticles = articles.filter(a => a.category.includes("Sports")).slice(0, 3);
  const entertainmentArticles = articles.filter(a => a.category.includes("Culture") || a.category.includes("Entertainment")).slice(0, 3);
  const featuredArticles = articles.filter(a => a.isFeatured).slice(0, 2);

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-4 md:py-6">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <main className="min-w-0 flex-1">
          {featured && (
            <article className="group mb-6 border-b border-dnews-border pb-6">
              <Link href={`/articles/${featured.slug}`}>
                <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
                  <Image
                    src={featured.imageUrl || FALLBACK_IMAGE}
                    alt={featured.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 780px"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="max-w-3xl">
                  <span className="mb-2 inline-block rounded bg-dnews-red px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    {featured.category}
                  </span>
                  <h2 className="font-heading mt-2 text-2xl font-bold leading-tight text-dnews-dark md:text-3xl lg:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-base leading-relaxed text-dnews-gray">
                    {featured.excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-sm text-dnews-muted">
                    <span className="font-medium text-dnews-dark">
                      By {featured.authorName}
                    </span>
                    <span>·</span>
                    <span>{featured.publishedAt}</span>
                    <span>·</span>
                    <span>{featured.readTime}</span>
                  </div>
                </div>
              </Link>
            </article>
          )}

          {featuredArticles.length > 1 && (
            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              {featuredArticles.slice(1).map((article) => (
                <ArticleCard key={article.id} article={article} priority />
              ))}
            </div>
          )}

          {featuredArticles.length <= 1 && articles.length > 1 && (
            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              {articles.slice(1, 3).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          <div className="space-y-10">
            <SectionArticles title="Latest News" articles={newsArticles} />
            <SectionArticles title="Business" articles={businessArticles} />
            <SectionArticles title="Sports" articles={sportsArticles} />
            <SectionArticles title="Entertainment" articles={entertainmentArticles} />
          </div>

          <AdSlot variant="banner" className="my-8" />

          <section>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-brand-red">
              More Stories
            </h3>
            {latest.length === 0 ? (
              <p className="text-sm text-dnews-muted">No articles published yet.</p>
            ) : (
              <div className="space-y-4">
                {latest.map((article) => (
                  <ArticleListItem
                    key={article.slug}
                    article={{
                      slug: article.slug,
                      title: article.title,
                      summary: article.excerpt,
                      category: { id: 0, name: article.category, slug: article.category.toLowerCase() },
                      author: { firstName: article.authorName.split(" ")[0], lastName: article.authorName.split(" ").slice(1).join(" ") || "" },
                      coverImageUrl: article.imageUrl,
                      coverImageAlt: article.imageAlt,
                      publishedAt: article.publishedAt,
                      createdAt: article.publishedAt,
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className="w-full shrink-0 lg:w-[300px]">
          <div className="border-t border-dnews-border pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <RightSidebar trendingArticles={trending} />
          </div>
        </aside>
      </div>
    </div>
  );
}
