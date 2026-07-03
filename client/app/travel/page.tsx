import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function TravelPage() {
  const articles = getArticlesByCategory("travel");
  return (
    <CategoryPage
      title="Travel"
      description="Travel stories, destinations, and experiences from across Africa and beyond."
      articles={articles}
    />
  );
}
