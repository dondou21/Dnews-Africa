import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function CulturePage() {
  const articles = getArticlesByCategory("culture");
  return (
    <CategoryPage
      title="Culture"
      description="Arts, literature, music, film, and the cultural movements shaping modern Africa."
      articles={articles}
    />
  );
}
