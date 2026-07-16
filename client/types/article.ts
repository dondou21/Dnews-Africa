export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
  parent?: Pick<ArticleCategory, "id" | "name" | "slug"> | null;
  children?: Pick<ArticleCategory, "id" | "name" | "slug" | "description">[];
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  children: Pick<ArticleCategory, "id" | "name" | "slug" | "description">[];
}

export interface ArticleAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio?: string | null;
}

export interface ArticleTag {
  tag: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface FeaturedImage {
  id: string;
  url: string;
  alt: string | null;
}

export type ArticleStatus = "IDEA" | "DRAFT" | "IN_REVIEW" | "NEEDS_REVISION" | "APPROVED" | "SCHEDULED" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage: FeaturedImage | null;
  status: ArticleStatus;
  isFeatured: boolean;
  isBreaking: boolean;
  allowComments: boolean;
  isTrending: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  archivedAt: string | null;
  changeReason: string | null;
  categoryId: number;
  category: ArticleCategory;
  authorId: string;
  author: ArticleAuthor;
  assignedEditorId: string | null;
  assignedEditor?: ArticleAuthor | null;
  tags: ArticleTag[];
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type Category = ArticleCategory;

export interface CategoryWithCount extends Category {
  description: string | null;
  parentId: number | null;
  parent: Pick<ArticleCategory, "id" | "name" | "slug"> | null;
  children: Pick<ArticleCategory, "id" | "name" | "slug" | "description">[];
  _count: { articles: number; children: number };
  createdAt: string;
  updatedAt: string;
}

export interface TagInfo {
  id: number;
  name: string;
  slug: string;
  _count: { articles: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  featuredImageId?: string;
  categoryId: number;
  status?: ArticleStatus;
  isFeatured?: boolean;
  isBreaking?: boolean;
  allowComments?: boolean;
  isTrending?: boolean;
  publishedAt?: string;
  scheduledAt?: string;
  tags?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateArticleInput extends Partial<CreateArticleInput> {}
