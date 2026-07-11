import { workflowRepository } from "../repositories/workflowRepository";
import { articleRepository } from "../repositories/articleRepository";
import { notificationService } from "./notificationService";
import { AppError } from "../middlewares/errorHandler";
import prisma from "../utils/prisma";
import type { AuthenticatedUser } from "../types/express";
import type { ArticleStatus } from "@prisma/client";

function canTransition(from: ArticleStatus, to: ArticleStatus): boolean {
  const transitions: Record<string, ArticleStatus[]> = {
    IDEA: ["DRAFT"],
    DRAFT: ["IN_REVIEW", "REJECTED"],
    IN_REVIEW: ["NEEDS_REVISION", "APPROVED", "REJECTED", "DRAFT"],
    NEEDS_REVISION: ["IN_REVIEW", "REJECTED", "DRAFT"],
    APPROVED: ["SCHEDULED", "PUBLISHED", "REJECTED", "DRAFT"],
    SCHEDULED: ["PUBLISHED", "DRAFT", "REJECTED"],
    PUBLISHED: ["ARCHIVED"],
    ARCHIVED: ["DRAFT", "REJECTED"],
    REJECTED: ["DRAFT"],
    PENDING_REVIEW: ["IN_REVIEW", "APPROVED", "NEEDS_REVISION", "REJECTED", "DRAFT"],
  };
  return transitions[from]?.includes(to) ?? false;
}

async function createRevisionSnapshot(articleId: string, changedById: string, changeReason?: string) {
  const article = await articleRepository.findById(articleId);
  if (!article) throw new AppError("Article not found", 404);
  const latestVersion = await workflowRepository.getLatestVersion(articleId);
  return workflowRepository.createRevision({
    articleId,
    version: latestVersion + 1,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    content: article.content,
    featuredImageId: article.coverImageUrl,
    changeReason,
    changedById,
  });
}

function getAuditAction(from: ArticleStatus, to: ArticleStatus): string {
  if (from === "DRAFT" && to === "IN_REVIEW") return "SUBMITTED";
  if (to === "APPROVED") return "APPROVED";
  if (to === "REJECTED") return "REJECTED";
  if (to === "NEEDS_REVISION") return "CHANGES_REQUESTED";
  if (to === "PUBLISHED") return "PUBLISHED";
  if (to === "SCHEDULED") return "SCHEDULED";
  if (to === "ARCHIVED") return "ARCHIVED";
  if (from === ("" as any)) return "CREATED";
  return "EDITED";
}

function hasEditorRole(user: AuthenticatedUser) {
  return user.role.name === "Admin" || user.role.name === "Editor";
}

function hasAuthorRole(user: AuthenticatedUser) {
  return user.role.name === "Journalist";
}

function hasModeratorRole(user: AuthenticatedUser) {
  return user.role.name === "Moderator";
}

export const workflowService = {
  async submitForReview(articleId: string, user: AuthenticatedUser, changeReason?: string) {
    const article = await articleRepository.findById(articleId);
    if (!article) throw new AppError("Article not found", 404);

    if (hasAuthorRole(user) && article.authorId !== user.id) {
      throw new AppError("You can only submit your own articles", 403);
    }

    if (!canTransition(article.status as ArticleStatus, "IN_REVIEW")) {
      throw new AppError(`Cannot submit article in ${article.status} status for review`, 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id: articleId },
        data: { status: "IN_REVIEW", submittedAt: new Date(), changeReason: changeReason ?? null },
      });

      const latestVersion = await workflowRepository.getLatestVersion(articleId);
      await tx.articleRevision.create({
        data: {
          articleId,
          version: latestVersion + 1,
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          content: article.content,
          featuredImageId: article.coverImageUrl,
          changeReason: changeReason ?? "Submitted for review",
          changedById: user.id,
        },
      });

      await tx.editorialApproval.create({
        data: {
          articleId,
          reviewerId: user.id,
          decision: "APPROVED",
          notes: "Initial submission",
        },
      });

      await tx.articleAuditLog.create({
        data: {
          articleId,
          userId: user.id,
          action: "SUBMITTED",
          fromStatus: article.status as ArticleStatus,
          toStatus: "IN_REVIEW",
          description: changeReason ?? "Submitted for review",
        },
      });

      return updated;
    });

    await notificationService.notifyArticleSubmitted(result as any);
    return result;
  },

  async approveArticle(articleId: string, user: AuthenticatedUser, notes?: string) {
    if (!hasEditorRole(user)) throw new AppError("Only editors can approve articles", 403);

    const article = await articleRepository.findById(articleId);
    if (!article) throw new AppError("Article not found", 404);

    if (!canTransition(article.status as ArticleStatus, "APPROVED")) {
      throw new AppError(`Cannot approve article in ${article.status} status`, 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id: articleId },
        data: { status: "APPROVED", approvedAt: new Date(), changeReason: notes ?? null },
      });

      await tx.editorialApproval.create({
        data: { articleId, reviewerId: user.id, decision: "APPROVED", notes },
      });

      await tx.articleAuditLog.create({
        data: {
          articleId, userId: user.id, action: "APPROVED",
          fromStatus: article.status as ArticleStatus, toStatus: "APPROVED",
          description: notes ?? "Article approved",
        },
      });

      return updated;
    });

    await notificationService.notifyApproved(article, article.authorId);
    return result;
  },

  async requestChanges(articleId: string, user: AuthenticatedUser, notes: string, sectionReference?: string) {
    if (!hasEditorRole(user)) throw new AppError("Only editors can request changes", 403);

    const article = await articleRepository.findById(articleId);
    if (!article) throw new AppError("Article not found", 404);

    if (!canTransition(article.status as ArticleStatus, "NEEDS_REVISION")) {
      throw new AppError(`Cannot request changes on article in ${article.status} status`, 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id: articleId },
        data: { status: "NEEDS_REVISION", changeReason: notes },
      });

      await tx.editorialApproval.create({
        data: { articleId, reviewerId: user.id, decision: "CHANGES_REQUESTED", notes },
      });

      await tx.editorialComment.create({
        data: {
          articleId, userId: user.id, comment: notes, sectionReference,
        },
      });

      await tx.articleAuditLog.create({
        data: {
          articleId, userId: user.id, action: "CHANGES_REQUESTED",
          fromStatus: article.status as ArticleStatus, toStatus: "NEEDS_REVISION",
          description: notes,
        },
      });

      return updated;
    });

    const editorName = `${user.firstName} ${user.lastName}`;
    await notificationService.notifyRequestChanges(article, article.authorId, editorName);
    return result;
  },

  async rejectArticle(articleId: string, user: AuthenticatedUser, notes: string) {
    if (!hasEditorRole(user)) throw new AppError("Only editors can reject articles", 403);

    const article = await articleRepository.findById(articleId);
    if (!article) throw new AppError("Article not found", 404);

    if (!canTransition(article.status as ArticleStatus, "REJECTED")) {
      throw new AppError(`Cannot reject article in ${article.status} status`, 400);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id: articleId },
        data: { status: "REJECTED", changeReason: notes },
      });

      await tx.editorialApproval.create({
        data: { articleId, reviewerId: user.id, decision: "REJECTED", notes },
      });

      await tx.articleAuditLog.create({
        data: {
          articleId, userId: user.id, action: "REJECTED",
          fromStatus: article.status as ArticleStatus, toStatus: "REJECTED",
          description: notes,
        },
      });

      return updated;
    });
  },

  async scheduleArticle(articleId: string, user: AuthenticatedUser, scheduledAt: string) {
    if (!hasEditorRole(user)) throw new AppError("Only editors can schedule articles", 403);

    const article = await articleRepository.findById(articleId);
    if (!article) throw new AppError("Article not found", 404);

    if (!canTransition(article.status as ArticleStatus, "SCHEDULED")) {
      throw new AppError(`Cannot schedule article in ${article.status} status`, 400);
    }

    const scheduleDate = new Date(scheduledAt);
    if (scheduleDate <= new Date()) {
      throw new AppError("Scheduled time must be in the future", 400);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id: articleId },
        data: { status: "SCHEDULED", scheduledAt: scheduleDate },
      });

      await tx.articleAuditLog.create({
        data: {
          articleId, userId: user.id, action: "SCHEDULED",
          fromStatus: article.status as ArticleStatus, toStatus: "SCHEDULED",
          description: `Scheduled for ${scheduleDate.toISOString()}`,
        },
      });

      return updated;
    });
  },

  async publishArticle(articleId: string, user: AuthenticatedUser) {
    if (!hasEditorRole(user)) throw new AppError("Only editors can publish articles", 403);

    const article = await articleRepository.findById(articleId);
    if (!article) throw new AppError("Article not found", 404);

    const validFrom = ["APPROVED", "SCHEDULED"];
    if (!validFrom.includes(article.status)) {
      throw new AppError(`Cannot publish article in ${article.status} status`, 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const updated = await tx.article.update({
        where: { id: articleId },
        data: { status: "PUBLISHED", publishedAt: now },
      });

      await tx.articleAuditLog.create({
        data: {
          articleId, userId: user.id, action: "PUBLISHED",
          fromStatus: article.status as ArticleStatus, toStatus: "PUBLISHED",
        },
      });

      return updated;
    });

    await notificationService.notifyPublished(
      article,
      article.authorId,
      `/articles/${article.slug}`,
    );

    return result;
  },

  async archiveArticle(articleId: string, user: AuthenticatedUser) {
    if (!hasEditorRole(user)) throw new AppError("Only editors can archive articles", 403);

    const article = await articleRepository.findById(articleId);
    if (!article) throw new AppError("Article not found", 404);

    if (!canTransition(article.status as ArticleStatus, "ARCHIVED")) {
      throw new AppError(`Cannot archive article in ${article.status} status`, 400);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id: articleId },
        data: { status: "ARCHIVED", archivedAt: new Date() },
      });

      await tx.articleAuditLog.create({
        data: {
          articleId, userId: user.id, action: "ARCHIVED",
          fromStatus: article.status as ArticleStatus, toStatus: "ARCHIVED",
        },
      });

      return updated;
    });
  },

  async restoreArticle(articleId: string, user: AuthenticatedUser) {
    const article = await articleRepository.findById(articleId);
    if (!article) throw new AppError("Article not found", 404);

    if (!canTransition(article.status as ArticleStatus, "DRAFT")) {
      throw new AppError(`Cannot restore article in ${article.status} status`, 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id: articleId },
        data: { status: "DRAFT", archivedAt: null },
      });

      await tx.articleAuditLog.create({
        data: {
          articleId, userId: user.id, action: "RESTORED",
          fromStatus: article.status as ArticleStatus, toStatus: "DRAFT",
        },
      });

      return updated;
    });

    return result;
  },

  async assignEditor(articleId: string, user: AuthenticatedUser, editorId: string) {
    if (!hasEditorRole(user)) throw new AppError("Only editors can assign editors", 403);

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!article) throw new AppError("Article not found", 404);

    const editor = await prisma.user.findUnique({
      where: { id: editorId },
      select: { id: true, role: { select: { name: true } } },
    });
    if (!editor) throw new AppError("Editor not found", 404);
    if (!["Admin", "Editor"].includes(editor.role.name)) {
      throw new AppError("User is not an editor", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id: articleId },
        data: { assignedEditorId: editorId },
      });

      await tx.articleAuditLog.create({
        data: {
          articleId, userId: user.id, action: "ASSIGNED",
          description: `Assigned to editor ${editorId}`,
          metadata: { editorId },
        },
      });

      return updated;
    });

    const assignerName = `${user.firstName} ${user.lastName}`;
    await notificationService.notifyAssigned(article, editorId, assignerName);
    return result;
  },

  async getWorkflowData(articleId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        assignedEditor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });
    if (!article) throw new AppError("Article not found", 404);

    const [revisions, comments, approvals, auditLogs] = await Promise.all([
      workflowRepository.getRevisions(articleId),
      workflowRepository.getComments(articleId),
      workflowRepository.getApprovals(articleId),
      workflowRepository.getAuditLogs(articleId),
    ]);

    return { article, revisions, comments, approvals, auditLogs };
  },

  async changeStatus(articleId: string, user: AuthenticatedUser, toStatus: ArticleStatus, options?: { notes?: string; scheduledAt?: string }) {
    const article = await articleRepository.findById(articleId);
    if (!article) throw new AppError("Article not found", 404);

    const currentStatus = article.status as ArticleStatus;

    if (!canTransition(currentStatus, toStatus)) {
      throw new AppError(`Cannot transition from ${currentStatus} to ${toStatus}`, 400);
    }

    if (hasAuthorRole(user) && article.authorId !== user.id) {
      throw new AppError("You can only modify your own articles", 403);
    }

    if (hasModeratorRole(user)) {
      throw new AppError("Moderators cannot change article status", 403);
    }

    if (hasAuthorRole(user) && !["DRAFT", "IN_REVIEW", "NEEDS_REVISION"].includes(toStatus)) {
      throw new AppError("Authors can only transition to Draft and In Review statuses", 403);
    }

    const updateData: Record<string, unknown> = { status: toStatus, changeReason: options?.notes ?? null };
    if (toStatus === "PUBLISHED") updateData.publishedAt = new Date();
    if (toStatus === "SCHEDULED" && options?.scheduledAt) updateData.scheduledAt = new Date(options.scheduledAt);
    if (toStatus === "ARCHIVED") updateData.archivedAt = new Date();
    if (toStatus === "IN_REVIEW") updateData.submittedAt = new Date();
    if (toStatus === "APPROVED") updateData.approvedAt = new Date();

    const auditAction = getAuditAction(currentStatus, toStatus);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id: articleId },
        data: updateData as any,
      });

      if (toStatus === "IN_REVIEW" || toStatus === "APPROVED" || toStatus === "NEEDS_REVISION" || toStatus === "REJECTED") {
        const decisionMap: Record<string, any> = {
          APPROVED: "APPROVED",
          IN_REVIEW: "APPROVED",
          NEEDS_REVISION: "CHANGES_REQUESTED",
          REJECTED: "REJECTED",
        };
        await tx.editorialApproval.create({
          data: {
            articleId, reviewerId: user.id,
            decision: decisionMap[toStatus] ?? "APPROVED",
            notes: options?.notes,
          },
        });
      }

      await tx.articleAuditLog.create({
        data: {
          articleId, userId: user.id,
          action: auditAction as any,
          fromStatus: currentStatus, toStatus,
          description: options?.notes ?? undefined,
        },
      });

      if (toStatus === "IN_REVIEW") {
        const articleWithAuthor = await tx.article.findUnique({
          where: { id: articleId },
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
        });
        if (articleWithAuthor) {
          await notificationService.notifyArticleSubmitted(articleWithAuthor as any);
        }
      }
      if (toStatus === "NEEDS_REVISION") {
        const editorName = `${user.firstName} ${user.lastName}`;
        await notificationService.notifyRequestChanges(article, article.authorId, editorName);
      }
      if (toStatus === "APPROVED") {
        await notificationService.notifyApproved(article, article.authorId);
      }
      if (toStatus === "PUBLISHED") {
        await notificationService.notifyPublished(article, article.authorId, `/articles/${article.slug}`);
      }

      return updated;
    });
  },
};
