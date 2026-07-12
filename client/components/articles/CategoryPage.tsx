"use client";

import { useEffect, useState } from "react";
import { get } from "@/lib/api-client";
import ArticleCard from "./ArticleCard";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage?: { url: string; alt: string | null } | null;
  publishedAt: string | null;
  createdAt: string;
  category: { id: number; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (categorySlug === "featured") {
          const articles = await get<ArticleItem[]>("/articles/featured");
          setArticles(articles);
        } else {
          const res = await get<{ articles: ArticleItem[] }>(
            `/articles?category=${categorySlug}&limit=20`
          );
          setArticles(res.articles);
        }
      } catch {
        // silently fail
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
        <div className="rounded border border-dnews-border p-8 text-center">
          <p className="text-dnews-muted">
            No articles in this category yet. Check back soon for updates.
          </p>
        </div>
      )}
    </div>
  );
}
