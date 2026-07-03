import type { Article } from "@/src/lib/articles";
import ArticleCard from "./ArticleCard";

interface CategoryPageProps {
  title: string;
  description: string;
  articles: Article[];
}

export default function CategoryPage({
  title,
  description,
  articles,
}: CategoryPageProps) {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-brand-red md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-dnews-gray">{description}</p>
      </div>

      {articles.length > 0 ? (
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
