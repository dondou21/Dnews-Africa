"use client";

import { useEffect, useState } from "react";
import RightSidebar from "@/components/home/RightSidebar";
import AdSlot from "@/components/home/AdSlot";
import ArticleCard from "@/components/home/ArticleCard";
import { get } from "@/lib/api-client";
import SectionHeader from "@/components/home/SectionHeader";
import { articles as fallbackArticles, getFeaturedArticle, getTrendingArticles, type Article as MockArticle } from "@/src/data/articles";
import type { CategoryWithCount } from "@/types/article";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage: { url: string; alt: string | null } | null;
  publishedAt: string | null;
  createdAt: string;
  isFeatured: boolean;
  category: { id: number; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
  authorName?: string | null;
  authorPosition?: string | null;
}

interface ApiResponse {
  articles: ArticleItem[];
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

  const heroArticle = featuredArticles.length > 0 ? featuredArticles[0] : (allArticles.length > 0 ? allArticles[0] : null);
  const usedSlugs = new Set(heroArticle ? [heroArticle.slug] : []);

  const secondaryArticles = allArticles.filter((a) => !usedSlugs.has(a.slug)).slice(0, 2);
  for (const a of secondaryArticles) usedSlugs.add(a.slug);

  const latest = allArticles.filter((a) => !usedSlugs.has(a.slug)).slice(0, 6);
  const fallback = fallbackArticles;

  const newsArticles = articlesInSection(["top-stories", "youth"]);
  const businessArticles = articlesInSection(["business"]);
  const sportsArticles = articlesInSection(["sports"]);
  const entertainmentArticles = articlesInSection(["culture", "lifestyle", "entertainment"]);

  if (!loading && allArticles.length === 0) {
    const featured = getFeaturedArticle();
    return {
      loading: false,
      heroArticle: featured ? {
        id: featured.id,
        title: featured.title,
        slug: featured.slug,
        summary: featured.excerpt,
        content: featured.content,
        coverImageUrl: featured.imageUrl,
        coverImageAlt: featured.imageAlt,
        featuredImage: null,
        publishedAt: featured.publishedAt,
        createdAt: featured.publishedAt,
        isFeatured: true,
        category: { id: 0, name: featured.category, slug: featured.category.toLowerCase() },
        author: { id: "", firstName: featured.authorName.split(" ")[0], lastName: "" },
      } : null,
      secondaryArticles: fallback.filter((a) => a.isFeatured).slice(1, 3).map(mockToArticleItem),
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
    heroArticle: heroArticle ? {
      ...heroArticle,
      category: { ...heroArticle.category },
      author: { ...heroArticle.author },
    } : null,
    secondaryArticles,
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
    content: a.content,
    coverImageUrl: a.imageUrl,
    coverImageAlt: a.imageAlt,
    featuredImage: null,
    publishedAt: a.publishedAt,
    createdAt: a.publishedAt,
    isFeatured: a.isFeatured,
    category: { id: 0, name: a.category, slug: a.category.toLowerCase() },
    author: { id: "", firstName: a.authorName.split(" ")[0], lastName: a.authorName.split(" ").slice(1).join(" ") || "" },
    authorName: a.authorName,
  };
}

export default function Home() {
  const data = useApiArticles();

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
    heroArticle,
    secondaryArticles,
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
          {heroArticle && (
            <section className="mb-6 border-b border-dnews-border pb-6">
              <ArticleCard article={heroArticle} variant="hero" priority />
            </section>
          )}

          {secondaryArticles.length > 0 && (
            <section className="mb-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {secondaryArticles.map((article, idx) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="secondary"
                    priority={idx === 0}
                  />
                ))}
              </div>
            </section>
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
              <div className="grid gap-6 sm:grid-cols-2">
                {latest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
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

function SectionArticles({ title, articles }: { title: string; articles: ArticleItem[] }) {
  if (articles.length === 0) return null;
  return (
    <section>
      <SectionHeader title={title} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
