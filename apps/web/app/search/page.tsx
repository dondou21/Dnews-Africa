"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { get } from "@dnews/api-client";
import ArticleCard from "@/components/articles/ArticleCard";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  publishedAt: string | null;
  createdAt: string;
  category: { id: number; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
  authorName?: string | null;
  authorPosition?: string | null;
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-[1180px] px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-brand-red md:text-4xl">
          Search
        </h1>
        <p className="mt-4 text-sm text-dnews-gray">Loading...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q");
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q || !q.trim()) return;
    setLoading(true);
    get<{ articles: ArticleItem[] }>(
      `/articles?search=${encodeURIComponent(q.trim())}&limit=20`
    )
      .then((res) => setArticles(res.articles))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [q]);

  if (!q) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-brand-red md:text-4xl">
          Search
        </h1>
        <p className="mt-4 text-sm text-dnews-gray">
          Search Dnews Africa articles by keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-brand-red md:text-4xl">
        Search
      </h1>
      <p className="mt-2 text-sm text-dnews-gray">
        {loading
          ? "Searching..."
          : `${articles.length} result${articles.length !== 1 ? "s" : ""} for &ldquo;${q}&rdquo;`}
      </p>

      {loading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-[16/9] rounded-sm bg-dnews-border/50" />
              <div className="h-4 w-3/4 rounded bg-dnews-border/50" />
              <div className="h-4 w-1/2 rounded bg-dnews-border/50" />
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded border border-dnews-border p-8 text-center">
          <p className="text-dnews-muted">
            No articles found for &ldquo;{q}&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}
