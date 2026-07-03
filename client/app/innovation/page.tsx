import { getArticlesByCategory } from "@/src/lib/articles";
import CategoryPage from "@/components/articles/CategoryPage";

export default function InnovationPage() {
  const articles = getArticlesByCategory("innovation");
  return (
    <CategoryPage
      title="Innovation"
      description="Technology, startups, and innovation stories highlighting African ingenuity and digital transformation."
      articles={articles}
    />
  );
}
