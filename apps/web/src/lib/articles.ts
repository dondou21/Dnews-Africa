import { articles, type Article } from "@/src/data/articles";

export type { Article };

export function getAllArticles(): Article[] {
  return articles;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: string): Article[] {
  const q = category.toLowerCase();
  if (q === "featured") {
    return articles.filter((a) => a.isFeatured);
  }
  return articles.filter((a) => a.category.toLowerCase().includes(q));
}

export function getFeaturedArticle(): Article | undefined {
  return articles.find((a) => a.isFeatured);
}

export function getTrendingArticles(): Article[] {
  return articles.filter((a) => a.isTrending);
}

export function getLatestArticles(count?: number): Article[] {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  return count ? sorted.slice(0, count) : sorted;
}

export function getRelatedArticles(
  current: Article,
  count = 3
): Article[] {
  return articles
    .filter((a) => a.id !== current.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase();
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
  );
}
