import { getMediaPublicUrl } from "../services/mediaService";

interface FeaturedImageRef {
  id: string;
  url: string;
  alt: string | null;
}

interface ArticleRaw {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage: FeaturedImageRef | null;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  submittedAt: Date | null;
  approvedAt: Date | null;
  archivedAt: Date | null;
  changeReason: string | null;
  categoryId: number;
  category: { id: number; name: string; slug: string };
  authorId: string;
  author: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  assignedEditorId: string | null;
  tags: { tag: { id: number; name: string; slug: string } }[];
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export function formatArticle<T extends ArticleRaw>(article: T) {
  let featuredImage: { id: string; url: string; alt: string | null } | null = null;

  if (article.featuredImage) {
    featuredImage = {
      id: article.featuredImage.id,
      url: article.featuredImage.url.startsWith("http")
        ? article.featuredImage.url
        : getMediaPublicUrl(article.featuredImage.url.replace("/uploads/", "")),
      alt: article.featuredImage.alt || article.coverImageAlt || null,
    };
  } else if (article.coverImageUrl) {
    featuredImage = {
      id: "",
      url: article.coverImageUrl.startsWith("http")
        ? article.coverImageUrl
        : getMediaPublicUrl(article.coverImageUrl.replace("/uploads/", "")),
      alt: article.coverImageAlt || null,
    };
  }

  return {
    ...article,
    featuredImage,
  };
}

export function formatArticleList<T extends ArticleRaw>(articles: T[]) {
  return articles.map(formatArticle);
}
