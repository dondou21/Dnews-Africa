import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function BusinessPage() {
  const articles = getArticlesByCategory("business");
  return (
    <CategoryPage
      title="Business"
      description="Business news, finance, innovation, and economic developments across the continent."
      articles={articles}
    />
  );
}
