import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function AfricaPage() {
  const articles = getArticlesByCategory("africa");
  return (
    <CategoryPage
      title="Africa"
      description="Stories and developments from across the African continent."
      articles={articles}
    />
  );
}
