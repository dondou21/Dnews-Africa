import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function OpinionPage() {
  const articles = getArticlesByCategory("opinion");
  return (
    <CategoryPage
      title="Opinion & Analysis"
      description="Thought-provoking commentary, editorials, and in-depth analysis on issues shaping the continent."
      articles={articles}
    />
  );
}
