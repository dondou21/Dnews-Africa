import type { Article, ArticleAuthor, ArticleCategory, ArticleTag } from "./article";

export type ApprovalDecision = "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";

export type AuditAction =
  | "CREATED" | "EDITED" | "SUBMITTED" | "APPROVED" | "REJECTED"
  | "CHANGES_REQUESTED" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED"
  | "RESTORED" | "ASSIGNED";

export interface ArticleRevision {
  id: string;
  articleId: string;
  version: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImageId: string | null;
  changeReason: string | null;
  changedById: string;
  changedBy: ArticleAuthor;
  createdAt: string;
}

export interface EditorialApproval {
  id: string;
  articleId: string;
  decision: ApprovalDecision;
  notes: string | null;
  reviewerId: string;
  reviewer: ArticleAuthor;
  createdAt: string;
}

export interface ArticleAuditLog {
  id: string;
  articleId: string;
  action: AuditAction;
  fromStatus: string | null;
  toStatus: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  userId: string;
  user: ArticleAuthor;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  userId: string;
  articleId: string | null;
  createdAt: string;
}

export interface WorkflowStats {
  myDrafts: number;
  pendingReviews: number;
  needsRevision: number;
  scheduledCount: number;
  publishedToday: number;
}

export interface WorkflowArticle extends Article {
  assignedEditor?: ArticleAuthor | null;
  category: ArticleCategory;
  author: ArticleAuthor;
  tags: ArticleTag[];
}

export interface WorkflowArticleResponse {
  article: WorkflowArticle;
  revisions: ArticleRevision[];
  approvals: EditorialApproval[];
  auditLogs: ArticleAuditLog[];
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface EditorOption {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string;
}
