import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function TVPage() {
  const articles = getArticlesByCategory("tv");
  return (
    <CategoryPage
      title="DnewsAfrica TV"
      description="Video reports, documentaries, and visual journalism from Dnews Africa."
      articles={articles}
    />
  );
}
