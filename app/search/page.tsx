import { searchArticles } from "@/src/lib/articles";
import ArticleCard from "@/components/articles/ArticleCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  if (!q || !q.trim()) {
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

  const results = searchArticles(q.trim());

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-brand-red md:text-4xl">
        Search
      </h1>
      <p className="mt-2 text-sm text-dnews-gray">
        {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
      </p>

      {results.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded border border-dnews-border p-8 text-center">
          <p className="text-dnews-muted">No articles found for &ldquo;{q}&rdquo;.</p>
        </div>
      )}
    </div>
  );
}
