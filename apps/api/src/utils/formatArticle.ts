import path from "path";
import { getMediaPublicUrl } from "../services/mediaService";

interface FeaturedImageRef {
  id: string;
  url: string;
  alt: string | null;
  caption?: string | null;
  credit?: string | null;
  source?: string | null;
  description?: string | null;
  copyright?: string | null;
  location?: string | null;
  dateTaken?: string | null;
}

interface ArticleRaw {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  featuredImageCaption?: string | null;
  featuredImageCredit?: string | null;
  featuredImageSource?: string | null;
  featuredImageDescription?: string | null;
  featuredImageCopyright?: string | null;
  featuredImageLocation?: string | null;
  featuredImageDateTaken?: string | null;
  featuredImage?: FeaturedImageRef | null;
  status?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  allowComments?: boolean;
  isTrending?: boolean;
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  submittedAt?: Date | null;
  approvedAt?: Date | null;
  archivedAt?: Date | null;
  changeReason?: string | null;
  categoryId?: number;
  category?: { id: number; name: string; slug: string };
  authorId?: string;
  author?: { id: string; firstName: string; lastName: string; avatarUrl: string | null };
  authorName?: string | null;
  authorPosition?: string | null;
  authorOrganization?: string | null;
  assignedEditorId?: string | null;
  tags?: { tag: { id: number; name: string; slug: string } }[];
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
}

function resolveMediaUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return getMediaPublicUrl(path.basename(url));
}

export function formatArticle<T extends ArticleRaw>(article: T) {
  let featuredImage: FeaturedImageRef | null = null;

  if (article.featuredImage) {
    featuredImage = {
      id: article.featuredImage.id,
      url: resolveMediaUrl(article.featuredImage.url),
      alt: article.featuredImage.alt || article.coverImageAlt || null,
    } as FeaturedImageRef;
    if (article.featuredImageCaption !== undefined) featuredImage.caption = article.featuredImageCaption;
    if (article.featuredImageCredit !== undefined) featuredImage.credit = article.featuredImageCredit;
    if (article.featuredImageSource !== undefined) featuredImage.source = article.featuredImageSource;
    if (article.featuredImageDescription !== undefined) featuredImage.description = article.featuredImageDescription;
    if (article.featuredImageCopyright !== undefined) featuredImage.copyright = article.featuredImageCopyright;
    if (article.featuredImageLocation !== undefined) featuredImage.location = article.featuredImageLocation;
    if (article.featuredImageDateTaken !== undefined) featuredImage.dateTaken = article.featuredImageDateTaken;
  } else if (article.coverImageUrl) {
    featuredImage = {
      id: "",
      url: resolveMediaUrl(article.coverImageUrl),
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
