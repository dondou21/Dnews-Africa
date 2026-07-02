import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function SportsPage() {
  const articles = getArticlesByCategory("sports");
  return (
    <CategoryPage
      title="Sports"
      description="Sports coverage including AFCON, athletics, and emerging talent across Africa."
      articles={articles}
    />
  );
}
