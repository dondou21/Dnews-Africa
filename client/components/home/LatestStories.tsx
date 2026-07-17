import ArticleListItem from "./ArticleListItem";

interface ArticleItem {
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: { id: number; name: string; slug: string };
  author: { firstName: string; lastName: string };
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export default function LatestStories({ articles }: { articles: ArticleItem[] }) {
  return (
    <section>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-red">
        Latest Stories
      </h3>
      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleListItem key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
