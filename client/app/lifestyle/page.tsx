import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function LifestylePage() {
  const articles = getArticlesByCategory("lifestyle");
  return (
    <CategoryPage
      title="Lifestyle"
      description="Fashion, food, wellness, and the lifestyle trends shaping modern Africa."
      articles={articles}
    />
  );
}
