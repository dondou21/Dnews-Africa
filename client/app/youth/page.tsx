import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function YouthPage() {
  const articles = getArticlesByCategory("youth");
  return (
    <CategoryPage
      title="Youth"
      description="Stories that amplify the voices of young Africans driving change across the continent."
      articles={articles}
    />
  );
}
