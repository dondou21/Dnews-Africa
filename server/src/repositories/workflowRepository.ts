import prisma from "../utils/prisma";
import type { ApprovalDecision, AuditAction, ArticleStatus } from "@prisma/client";

const revisionInclude = {
  changedBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
} as const;

const commentInclude = {
  user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: { select: { name: true } } } },
  replies: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: { select: { name: true } } } },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

const approvalInclude = {
  reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
} as const;

const auditLogInclude = {
  user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
} as const;

export const workflowRepository = {
  async createRevision(data: {
    articleId: string;
    version: number;
    title: string;
    slug: string;
    summary: string;
    content: string;
    featuredImageId?: string | null;
    changeReason?: string;
    changedById: string;
  }) {
    return prisma.articleRevision.create({ data, include: revisionInclude });
  },

  async getLatestVersion(articleId: string) {
    const revision = await prisma.articleRevision.findFirst({
      where: { articleId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    return revision?.version ?? 0;
  },

  async getRevisions(articleId: string) {
    return prisma.articleRevision.findMany({
      where: { articleId },
      orderBy: { version: "desc" },
      include: revisionInclude,
    });
  },

  async getRevision(articleId: string, version: number) {
    return prisma.articleRevision.findUnique({
      where: { articleId_version: { articleId, version } },
    });
  },

  async createComment(data: {
    articleId: string;
    userId: string;
    comment: string;
    sectionReference?: string;
    parentId?: string;
  }) {
    return prisma.editorialComment.create({ data, include: commentInclude });
  },

  async getComments(articleId: string) {
    return prisma.editorialComment.findMany({
      where: { articleId, parentId: null },
      orderBy: { createdAt: "desc" },
      include: commentInclude,
    });
  },

  async resolveComment(commentId: string, resolved: boolean) {
    return prisma.editorialComment.update({
      where: { id: commentId },
      data: { resolved },
      include: commentInclude,
    });
  },

  async createApproval(data: {
    articleId: string;
    reviewerId: string;
    decision: ApprovalDecision;
    notes?: string;
  }) {
    return prisma.editorialApproval.create({ data, include: approvalInclude });
  },

  async getApprovals(articleId: string) {
    return prisma.editorialApproval.findMany({
      where: { articleId },
      orderBy: { createdAt: "desc" },
      include: approvalInclude,
    });
  },

  async createAuditLog(data: {
    articleId: string;
    userId: string;
    action: AuditAction;
    fromStatus?: ArticleStatus;
    toStatus?: ArticleStatus;
    description?: string;
    metadata?: any;
  }) {
    return prisma.articleAuditLog.create({ data: data as any, include: auditLogInclude });
  },

  async getAuditLogs(articleId: string) {
    return prisma.articleAuditLog.findMany({
      where: { articleId },
      orderBy: { createdAt: "desc" },
      include: auditLogInclude,
    });
  },

  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    articleId?: string;
  }) {
    return prisma.notification.create({ data });
  },

  async getNotifications(userId: string, unreadOnly = false) {
    const where: Record<string, unknown> = { userId };
    if (unreadOnly) where.read = false;
    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  async markNotificationRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  },

  async getEditors() {
    return prisma.user.findMany({
      where: {
        role: { name: { in: ["Admin", "Editor"] } },
        isActive: true,
      },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true },
    });
  },

  async getWorkflowStats(userId: string) {
    const [
      myDrafts,
      pendingReviews,
      needsRevision,
      scheduledCount,
      publishedToday,
    ] = await Promise.all([
      prisma.article.count({ where: { authorId: userId, status: "DRAFT" } }),
      prisma.article.count({ where: { status: "IN_REVIEW" } }),
      prisma.article.count({ where: { status: "NEEDS_REVISION", authorId: userId } }),
      prisma.article.count({ where: { status: "SCHEDULED" } }),
      prisma.article.count({
        where: {
          status: "PUBLISHED",
          publishedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return { myDrafts, pendingReviews, needsRevision, scheduledCount, publishedToday };
  },
};
