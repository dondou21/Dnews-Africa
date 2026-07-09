"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LeftSidebar from "@/components/home/LeftSidebar";
import RightSidebar from "@/components/home/RightSidebar";
import AdSlot from "@/components/home/AdSlot";
import ArticleListItem from "@/components/home/ArticleListItem";
import { get } from "@/lib/api-client";

interface HomeArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: { id: number; name: string; slug: string };
  author: { firstName: string; lastName: string };
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function Home() {
  const [featured, setFeatured] = useState<HomeArticle | null>(null);
  const [latest, setLatest] = useState<HomeArticle[]>([]);
  const [trending, setTrending] = useState<HomeArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [featuredData, latestData] = await Promise.all([
          get<HomeArticle[]>("/articles/featured"),
          get<HomeArticle[]>("/articles/latest"),
        ]);
        setFeatured(featuredData[0] || null);
        setLatest(latestData.slice(0, 6));
        setTrending(latestData.filter((a) => a.isTrending).slice(0, 5));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-4 md:py-5">
      <div className="flex flex-col lg:flex-row lg:gap-6">
        <aside className="hidden w-full shrink-0 lg:block lg:w-[200px]">
          <div className="border-r border-dnews-border pr-4">
            <LeftSidebar />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {loading ? (
            <div className="space-y-4">
              <div className="aspect-[16/9] w-full animate-pulse rounded-sm bg-dnews-border/50" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-dnews-border/50" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-dnews-border/50" />
            </div>
          ) : featured ? (
            <article className="group mb-6 border-b border-dnews-border pb-6">
              <Link href={`/articles/${featured.slug}`}>
                {featured.coverImageUrl && (
                  <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={featured.coverImageUrl}
                      alt={featured.coverImageAlt || ""}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 640px"
                      priority
                    />
                  </div>
                )}
                <div>
                  <span className="mb-2 inline-block rounded bg-dnews-red px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    {featured.category.name}
                  </span>
                  <h2 className="font-heading mt-2 text-xl font-bold leading-tight text-dnews-dark md:text-2xl">
                    {featured.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-dnews-gray">
                    {featured.summary}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-dnews-muted">
                    <span className="font-medium text-dnews-dark">
                      By {featured.author.firstName} {featured.author.lastName}
                    </span>
                    <span>·</span>
                    <span>
                      {featured.publishedAt
                        ? new Date(featured.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : new Date(featured.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ) : null}

          <AdSlot variant="banner" className="mb-6" />

          <section>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-red">
              Latest Stories
            </h3>
            {latest.length === 0 && !loading ? (
              <p className="text-sm text-dnews-muted">
                No articles published yet.
              </p>
            ) : (
              <div className="space-y-4">
                {latest.map((article) => (
                  <ArticleListItem key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className="w-full shrink-0 lg:w-[260px]">
          <div className="border-t border-dnews-border pt-6 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <RightSidebar trendingArticles={trending} />
          </div>
        </aside>
      </div>
    </div>
  );
}
