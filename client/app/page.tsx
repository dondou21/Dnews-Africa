"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "@/components/shared/AppImage";
import RightSidebar from "@/components/home/RightSidebar";
import AdSlot from "@/components/home/AdSlot";
import ArticleListItem from "@/components/home/ArticleListItem";
import { get } from "@/lib/api-client";
import { getFeaturedImageUrl, FALLBACK_IMAGE } from "@/lib/image";
import SectionHeader from "@/components/home/SectionHeader";
import { articles as fallbackArticles, getFeaturedArticle, getTrendingArticles, type Article as MockArticle } from "@/src/data/articles";
import type { CategoryWithCount } from "@/types/article";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage: { url: string; alt: string | null } | null;
  publishedAt: string | null;
  createdAt: string;
  isFeatured: boolean;
  category: { id: number; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
}

interface ApiResponse {
  articles: ArticleItem[];
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

function buildCategorySlugMap(categories: CategoryWithCount[]): Record<string, Set<string>> {
  const map: Record<string, Set<string>> = {};
  const childrenByParent: Record<number, string[]> = {};
  const slugById: Record<number, string> = {};

  for (const cat of categories) {
    slugById[cat.id] = cat.slug;
    if (cat.parentId != null) {
      if (!childrenByParent[cat.parentId]) childrenByParent[cat.parentId] = [];
      childrenByParent[cat.parentId].push(cat.slug);
    }
  }

  function getAllDescendants(slug: string, visited: Set<string> = new Set()): Set<string> {
    if (visited.has(slug)) return visited;
    visited.add(slug);
    const cat = categories.find((c) => c.slug === slug);
    if (cat) {
      const childSlugs = childrenByParent[cat.id] || [];
      for (const childSlug of childSlugs) {
        getAllDescendants(childSlug, visited);
      }
    }
    return visited;
  }

  for (const cat of categories) {
    if (cat.parentId == null) {
      map[cat.slug] = getAllDescendants(cat.slug);
    }
  }

  return map;
}

function useApiArticles() {
  const [allArticles, setAllArticles] = useState<ArticleItem[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ArticleItem[]>([]);
  const [trending, setTrending] = useState<ArticleItem[]>([]);
  const [categorySlugMap, setCategorySlugMap] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [allRes, featuredRes, cats] = await Promise.all([
          get<ApiResponse>("/articles?limit=30"),
          get<ArticleItem[]>("/articles/featured"),
          get<CategoryWithCount[]>("/categories"),
        ]);
        if (cancelled) return;
        setAllArticles(allRes.articles || []);
        setFeaturedArticles(featuredRes || []);
        setCategorySlugMap(buildCategorySlugMap(cats));
        const latest = allRes.articles || [];
        setTrending(latest.filter((a) => a.isFeatured || a.featuredImage).slice(0, 5));
      } catch {
        if (!cancelled) {
          console.error("Failed to fetch homepage articles");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function articlesInSection(sectionSlugs: string[]): ArticleItem[] {
    const allowed = new Set(sectionSlugs);
    for (const slug of sectionSlugs) {
      const descendants = categorySlugMap[slug];
      if (descendants) {
        for (const d of descendants) allowed.add(d);
      }
    }
    return allArticles.filter((a) => allowed.has(a.category?.slug)).slice(0, 3);
  }

  const latest = allArticles.slice(0, 6);
  const heroFeatured = featuredArticles.length > 0 ? featuredArticles[0] : (allArticles.length > 0 ? allArticles[0] : null);
  const featuredCards = featuredArticles.length > 1 ? featuredArticles.slice(1, 3) : (allArticles.length > 1 ? allArticles.slice(0, 2) : []);
  const fallback = fallbackArticles;

  const newsArticles = articlesInSection(["top-stories", "youth"]);
  const businessArticles = articlesInSection(["business"]);
  const sportsArticles = articlesInSection(["sports"]);
  const entertainmentArticles = articlesInSection(["culture", "lifestyle", "entertainment"]);

  if (!loading && allArticles.length === 0) {
    return {
      loading: false,
      heroFeatured: getFeaturedArticle() ? {
        id: getFeaturedArticle()!.id,
        title: getFeaturedArticle()!.title,
        slug: getFeaturedArticle()!.slug,
        summary: getFeaturedArticle()!.excerpt,
        coverImageUrl: getFeaturedArticle()!.imageUrl,
        coverImageAlt: getFeaturedArticle()!.imageAlt,
        featuredImage: null,
        publishedAt: getFeaturedArticle()!.publishedAt,
        createdAt: getFeaturedArticle()!.publishedAt,
        isFeatured: true,
        category: { id: 0, name: getFeaturedArticle()!.category, slug: getFeaturedArticle()!.category.toLowerCase() },
        author: { id: "", firstName: getFeaturedArticle()!.authorName.split(" ")[0], lastName: "" },
      } : null,
      featuredCards: fallback.filter((a) => a.isFeatured).slice(1, 3).map(mockToArticleItem),
      trending: getTrendingArticles().slice(0, 5).map(mockToArticleItem),
      latest: fallback.slice(0, 6).map(mockToArticleItem),
      newsArticles: fallback.filter((a) => a.category.includes("News") || a.category === "Youth").slice(0, 3).map(mockToArticleItem),
      businessArticles: fallback.filter((a) => a.category.includes("Business")).slice(0, 3).map(mockToArticleItem),
      sportsArticles: fallback.filter((a) => a.category.includes("Sports")).slice(0, 3).map(mockToArticleItem),
      entertainmentArticles: fallback.filter((a) => a.category.includes("Culture") || a.category.includes("Entertainment")).slice(0, 3).map(mockToArticleItem),
      isFallback: true,
    };
  }

  return {
    loading,
    heroFeatured: heroFeatured ? {
      ...heroFeatured,
      category: { ...heroFeatured.category },
      author: { ...heroFeatured.author },
    } : null,
    featuredCards,
    trending: trending.length > 0 ? trending : allArticles.slice(0, 5),
    latest,
    newsArticles,
    businessArticles,
    sportsArticles,
    entertainmentArticles,
    isFallback: false,
  };
}

function mockToArticleItem(a: MockArticle): ArticleItem {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    summary: a.excerpt,
    coverImageUrl: a.imageUrl,
    coverImageAlt: a.imageAlt,
    featuredImage: null,
    publishedAt: a.publishedAt,
    createdAt: a.publishedAt,
    isFeatured: a.isFeatured,
    category: { id: 0, name: a.category, slug: a.category.toLowerCase() },
    author: { id: "", firstName: a.authorName.split(" ")[0], lastName: a.authorName.split(" ").slice(1).join(" ") || "" },
  };
}

export default function Home() {
  const data = useApiArticles();
  const [heroIndex, setHeroIndex] = useState(0);

  const carouselArticles = data.heroFeatured
    ? [data.heroFeatured, ...data.featuredCards].filter(Boolean).slice(0, 5)
    : [];

  useEffect(() => {
    if (carouselArticles.length < 2) return;
    const id = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % carouselArticles.length);
    }, 6000);
    return () => clearInterval(id);
  }, [carouselArticles.length]);

  if (data.loading) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-4 md:py-6">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <main className="min-w-0 flex-1">
            <div className="mb-6 animate-pulse space-y-4">
              <div className="aspect-[16/9] w-full rounded-sm bg-dnews-border/50" />
              <div className="h-8 w-3/4 rounded bg-dnews-border/50" />
              <div className="h-4 w-1/2 rounded bg-dnews-border/50" />
            </div>
          </main>
          <aside className="w-full shrink-0 lg:w-[300px]">
            <div className="animate-pulse space-y-4">
              <div className="h-40 rounded-sm bg-dnews-border/50" />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  const {
    heroFeatured,
    featuredCards,
    trending,
    latest,
    newsArticles,
    businessArticles,
    sportsArticles,
    entertainmentArticles,
  } = data;

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-4 md:py-6">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <main className="min-w-0 flex-1">
          <section className="mb-6 border-b border-dnews-border pb-6">
              <div className="relative overflow-hidden rounded-sm">
                {carouselArticles.map((article, idx) => (
                  <article
                    key={article.slug}
                    className={`transition-opacity duration-700 ${idx === heroIndex ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"}`}
                  >
                    <Link href={`/articles/${article.slug}`}>
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-dnews-light-gray">
                        <Image
                          src={getFeaturedImageUrl(article.featuredImage, article.coverImageUrl)}
                          alt={article.featuredImage?.alt || article.coverImageAlt || article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 780px"
                          priority={idx === 0}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                          <span className="mb-2 inline-block rounded bg-dnews-red px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                            {article.category?.name || ""}
                          </span>
                          <h2 className="font-heading mt-2 text-xl font-bold leading-tight text-white md:text-2xl lg:text-3xl">
                            {article.title}
                          </h2>
                          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/80 max-w-2xl">
                            {article.summary}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/60">
                            <span className="font-medium text-white/80">
                              By {article.author?.firstName || ""} {article.author?.lastName || ""}
                            </span>
                            <span>·</span>
                            <span>{formatDate(article.publishedAt)}</span>
                            <span>·</span>
                            <span>{estimateReadingTime(article.summary + " " + (article as any).content || "")} min read</span>
                          </div>
                          <span className="mt-3 inline-block rounded-sm border border-white/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white hover:text-dnews-dark">
                            Read More
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {carouselArticles.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  {carouselArticles.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === heroIndex ? "w-8 bg-dnews-red" : "w-2 bg-dnews-border hover:bg-dnews-muted"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </section>

          {carouselArticles.length > 0 && featuredCards.length > 0 && (
            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              {featuredCards.filter((a) => !carouselArticles.some((c) => c.slug === a.slug)).slice(0, 2).map((article) => (
                <FeaturedCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {featuredCards.length === 0 && latest.length > 0 && (
            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              {latest.slice(0, 2).map((article) => (
                <FeaturedCard key={article.id} article={article} />
              ))}
            </div>
          )}

          <div className="space-y-10">
            {newsArticles.length > 0 && (
              <SectionArticles title="Latest News" articles={newsArticles} />
            )}
            {businessArticles.length > 0 && (
              <SectionArticles title="Business" articles={businessArticles} />
            )}
            {sportsArticles.length > 0 && (
              <SectionArticles title="Sports" articles={sportsArticles} />
            )}
            {entertainmentArticles.length > 0 && (
              <SectionArticles title="Entertainment" articles={entertainmentArticles} />
            )}
          </div>

          <AdSlot variant="banner" className="my-8" />

          <section>
            <SectionHeader title="More Stories" />
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
                      summary: article.summary,
                      category: article.category,
                      author: article.author,
                      coverImageUrl: article.coverImageUrl,
                      coverImageAlt: article.coverImageAlt,
                      featuredImage: article.featuredImage,
                      publishedAt: article.publishedAt,
                      createdAt: article.createdAt,
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

function FeaturedCard({ article }: { article: ArticleItem }) {
  return (
    <article className="group">
      <Link href={`/articles/${article.slug}`}>
        <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
          <Image
            src={getFeaturedImageUrl(article.featuredImage, article.coverImageUrl)}
            alt={article.featuredImage?.alt || article.coverImageAlt || article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = FALLBACK_IMAGE;
            }}
          />
        </div>
        <span className="mb-1.5 inline-block text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
          {article.category?.name || ""}
        </span>
        <h3 className="font-heading text-base font-bold leading-snug text-dnews-dark transition-colors group-hover:text-dnews-accent">
          {article.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-dnews-gray">
          {article.summary}
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-dnews-muted">
          <span className="font-medium text-dnews-dark">
            By {article.author?.firstName || ""} {article.author?.lastName || ""}
          </span>
          <span>·</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>
      </Link>
    </article>
  );
}

function SectionArticles({ title, articles }: { title: string; articles: ArticleItem[] }) {
  if (articles.length === 0) return null;
  return (
    <section>
      <SectionHeader title={title} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <FeaturedCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
