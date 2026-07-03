import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function InterviewsPage() {
  const articles = getArticlesByCategory("interviews");
  return (
    <CategoryPage
      title="Interviews"
      description="Exclusive conversations with thought leaders, entrepreneurs, and changemakers from across Africa."
      articles={articles}
    />
  );
}
