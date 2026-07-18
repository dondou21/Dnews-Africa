"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { get } from "@dnews/api-client";
import ArticleCard from "./ArticleCard";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage?: { url: string; alt: string | null } | null;
  publishedAt: string | null;
  createdAt: string;
  category: { id: number; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
  authorName?: string | null;
  authorPosition?: string | null;
}

interface ApiResponse {
  articles: ArticleItem[];
}

interface CategoryPageProps {
  title: string;
  description: string;
  categorySlug: string;
}

export default function CategoryPage({
  title,
  description,
  categorySlug,
}: CategoryPageProps) {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [latestArticles, setLatestArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (categorySlug === "featured") {
          const articles = await get<ArticleItem[]>("/articles/featured");
          setArticles(articles);
        } else {
          const [catRes, latestRes] = await Promise.all([
            get<ApiResponse>(`/articles?category=${categorySlug}&limit=20`),
            get<ApiResponse>("/articles?limit=4").catch(() => null),
          ]);
          setArticles(catRes.articles);
          if (latestRes) {
            setLatestArticles(latestRes.articles);
          }
        }
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categorySlug]);

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-brand-red md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-dnews-gray">{description}</p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-[16/9] rounded-sm bg-dnews-border/50" />
              <div className="h-4 w-3/4 rounded bg-dnews-border/50" />
              <div className="h-4 w-1/2 rounded bg-dnews-border/50" />
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-12 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-dnews-light-gray">
              <svg className="h-8 w-8 text-dnews-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl font-bold text-dnews-dark">
              No published articles yet
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-dnews-muted">
              There are currently no published articles in <strong className="text-dnews-dark">{title}</strong>.
              Our team is working on bringing you the latest stories. Please check back later.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="rounded-sm bg-dnews-accent px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
              >
                Back to Home
              </Link>
              <Link
                href="/news"
                className="rounded-sm border border-dnews-border px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-dnews-gray transition-colors hover:bg-dnews-light-gray"
              >
                Browse All News
              </Link>
            </div>
          </div>
        </div>
      )}

      {!loading && articles.length === 0 && latestArticles.length > 0 && (
        <section className="mt-10">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-brand-red">
            Latest Articles
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
