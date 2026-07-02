import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function FeaturedPage() {
  const articles = getArticlesByCategory("featured");
  return (
    <CategoryPage
      title="Featured"
      description="Featured stories handpicked by our editorial team for in-depth coverage."
      articles={articles}
    />
  );
}
