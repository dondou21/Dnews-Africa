import type { Article } from "@/src/data/articles";
import ArticleListItem from "./ArticleListItem";

export default function LatestStories({ articles }: { articles: Article[] }) {
  return (
    <section>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-red">
        Latest Stories
      </h3>
      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleListItem key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
