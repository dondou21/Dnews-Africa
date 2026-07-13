"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RightSidebar from "@/components/home/RightSidebar";
import AdSlot from "@/components/home/AdSlot";
import ArticleListItem from "@/components/home/ArticleListItem";
import { get } from "@/lib/api-client";
import { getFeaturedImageUrl, FALLBACK_IMAGE } from "@/lib/image";
import CategoryNav from "@/components/home/CategoryNav";
import { articles as fallbackArticles, getFeaturedArticle, getTrendingArticles, type Article as MockArticle } from "@/src/data/articles";

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

function useApiArticles() {
  const [allArticles, setAllArticles] = useState<ArticleItem[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<ArticleItem[]>([]);
  const [trending, setTrending] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [allRes, featuredRes] = await Promise.all([
          get<ApiResponse>("/articles?limit=30"),
          get<ArticleItem[]>("/articles/featured"),
        ]);
        setAllArticles(allRes.articles || []);
        setFeaturedArticles(featuredRes || []);
        const latest = allRes.articles || [];
        setTrending(latest.filter((a) => a.isFeatured || a.featuredImage).slice(0, 5));
      } catch {
        setAllArticles([]);
        setFeaturedArticles([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const latest = allArticles.slice(0, 6);
  const heroFeatured = featuredArticles.length > 0 ? featuredArticles[0] : null;
  const featuredCards = featuredArticles.slice(1, 3);
  const fallback = fallbackArticles;

  const newsArticles = allArticles.filter((a) =>
    ["top-stories", "news", "youth"].includes(a.category?.slug)
  ).slice(0, 3);

  const businessArticles = allArticles.filter((a) =>
    a.category?.slug === "business"
  ).slice(0, 3);

  const sportsArticles = allArticles.filter((a) =>
    a.category?.slug === "sports"
  ).slice(0, 3);

  const entertainmentArticles = allArticles.filter((a) =>
    ["culture", "entertainment", "lifestyle"].includes(a.category?.slug)
  ).slice(0, 3);

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
          {heroFeatured && (
            <article className="group mb-6 border-b border-dnews-border pb-6">
              <Link href={`/articles/${heroFeatured.slug}`}>
                <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
                  <Image
                    src={getFeaturedImageUrl(heroFeatured.featuredImage, heroFeatured.coverImageUrl)}
                    alt={heroFeatured.featuredImage?.alt || heroFeatured.coverImageAlt || heroFeatured.title}
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
                    {heroFeatured.category?.name || ""}
                  </span>
                  <h2 className="font-heading mt-2 text-2xl font-bold leading-tight text-dnews-dark md:text-3xl lg:text-4xl">
                    {heroFeatured.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-base leading-relaxed text-dnews-gray">
                    {heroFeatured.summary}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-sm text-dnews-muted">
                    <span className="font-medium text-dnews-dark">
                      By {heroFeatured.author?.firstName || ""} {heroFeatured.author?.lastName || ""}
                    </span>
                    <span>·</span>
                    <span>{formatDate(heroFeatured.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            </article>
          )}

          {featuredCards.length > 0 && (
            <div className="mb-8 grid gap-6 sm:grid-cols-2">
              {featuredCards.map((article) => (
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

          <CategoryNav />

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
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-brand-red">
        {title}
      </h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <FeaturedCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
