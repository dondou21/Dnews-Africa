import Link from "next/link";

interface TrendingArticle {
  id: string;
  title: string;
  slug: string;
}

export default function TrendingWidget({ articles }: { articles: TrendingArticle[] }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-red">
        Trending · Most Read
      </h3>
      <div className="space-y-3">
        {articles.map((article, i) => (
          <div key={article.id} className="flex gap-3 border-b border-dnews-border pb-3">
            <span className="w-6 text-lg font-bold leading-none text-dnews-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <Link
              href={`/articles/${article.slug}`}
              className="text-sm font-medium leading-snug text-dnews-dark transition-colors hover:text-dnews-accent"
            >
              {article.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
