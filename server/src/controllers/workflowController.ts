import { Request, Response, NextFunction } from "express";
import { Prisma, $Enums } from "@prisma/client";
import { workflowService } from "../services/workflowService";
import { workflowRepository } from "../repositories/workflowRepository";
import { AppError } from "../middlewares/errorHandler";
import prisma from "../utils/prisma";
import {
  submitForReviewSchema,
  approveArticleSchema,
  requestChangesSchema,
  rejectArticleSchema,
  assignEditorSchema,
  scheduleArticleSchema,
  createEditorialCommentSchema,
  resolveCommentSchema,
  restoreRevisionSchema,
} from "../validators/workflowValidator";

export const workflowController = {
  async submitForReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = submitForReviewSchema.safeParse(req.body);
      const changeReason = parsed.success ? parsed.data.changeReason : undefined;
      const article = await workflowService.submitForReview(id, req.user!, changeReason);
      res.json({ status: "success", data: article });
    } catch (error) { next(error); }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = approveArticleSchema.safeParse(req.body);
      const notes = parsed.success ? parsed.data.notes : undefined;
      const article = await workflowService.approveArticle(id, req.user!, notes);
      res.json({ status: "success", data: article });
    } catch (error) { next(error); }
  },

  async requestChanges(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = requestChangesSchema.parse(req.body);
      const article = await workflowService.requestChanges(id, req.user!, parsed.notes, parsed.sectionReference);
      res.json({ status: "success", data: article });
    } catch (error) { next(error); }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = rejectArticleSchema.parse(req.body);
      const article = await workflowService.rejectArticle(id, req.user!, parsed.notes);
      res.json({ status: "success", data: article });
    } catch (error) { next(error); }
  },

  async schedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = scheduleArticleSchema.parse(req.body);
      const article = await workflowService.scheduleArticle(id, req.user!, parsed.scheduledAt);
      res.json({ status: "success", data: article });
    } catch (error) { next(error); }
  },

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await workflowService.publishArticle(id, req.user!);
      res.json({ status: "success", data: article });
    } catch (error) { next(error); }
  },

  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await workflowService.archiveArticle(id, req.user!);
      res.json({ status: "success", data: article });
    } catch (error) { next(error); }
  },

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await workflowService.restoreArticle(id, req.user!);
      res.json({ status: "success", data: article });
    } catch (error) { next(error); }
  },

  async assignEditor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = assignEditorSchema.parse(req.body);
      const article = await workflowService.assignEditor(id, req.user!, parsed.editorId);
      res.json({ status: "success", data: article });
    } catch (error) { next(error); }
  },

  async getWorkflowData(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await workflowService.getWorkflowData(id);
      res.json({ status: "success", data });
    } catch (error) { next(error); }
  },

  async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status: toStatus, notes, scheduledAt } = req.body;
      if (!toStatus) throw new AppError("Status is required", 400);
      const article = await workflowService.changeStatus(id, req.user!, toStatus, { notes, scheduledAt });
      res.json({ status: "success", data: article });
    } catch (error) { next(error); }
  },

  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const comments = await workflowRepository.getComments(id);
      res.json({ status: "success", data: comments });
    } catch (error) { next(error); }
  },

  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = createEditorialCommentSchema.parse(req.body);
      const comment = await workflowRepository.createComment({
        articleId: id,
        userId: req.user!.id,
        comment: parsed.comment,
        sectionReference: parsed.sectionReference,
        parentId: parsed.parentId,
      });
      res.status(201).json({ status: "success", data: comment });
    } catch (error) { next(error); }
  },

  async resolveComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { commentId } = req.params;
      const parsed = resolveCommentSchema.parse(req.body);
      const comment = await workflowRepository.resolveComment(commentId, parsed.resolved);
      res.json({ status: "success", data: comment });
    } catch (error) { next(error); }
  },

  async getRevisions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const revisions = await workflowRepository.getRevisions(id);
      res.json({ status: "success", data: revisions });
    } catch (error) { next(error); }
  },

  async getRevision(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, version } = req.params;
      const revision = await workflowRepository.getRevision(id, parseInt(version));
      if (!revision) throw new AppError("Revision not found", 404);
      res.json({ status: "success", data: revision });
    } catch (error) { next(error); }
  },

  async restoreRevision(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, version } = req.params;
      const parsed = restoreRevisionSchema.safeParse(req.body);
      const changeReason = parsed.success ? parsed.data.changeReason : undefined;
      const revision = await workflowRepository.getRevision(id, parseInt(version));
      if (!revision) throw new AppError("Revision not found", 404);
      const article = await workflowService.changeStatus(id, req.user!, "DRAFT", { notes: changeReason ?? `Restored from version ${version}` });
      res.json({ status: "success", data: article });
    } catch (error) { next(error); }
  },

  async getApprovals(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const approvals = await workflowRepository.getApprovals(id);
      res.json({ status: "success", data: approvals });
    } catch (error) { next(error); }
  },

  async getAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const logs = await workflowRepository.getAuditLogs(id);
      res.json({ status: "success", data: logs });
    } catch (error) { next(error); }
  },

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const unreadOnly = req.query.unread === "true";
      const notifications = await workflowRepository.getNotifications(req.user!.id, unreadOnly);
      const unreadCount = (await workflowRepository.getNotifications(req.user!.id, true)).length;
      res.json({ status: "success", data: { notifications, unreadCount } });
    } catch (error) { next(error); }
  },

  async markNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await workflowRepository.markNotificationRead(id);
      res.json({ status: "success", data: notification });
    } catch (error) { next(error); }
  },

  async getWorkflowStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await workflowRepository.getWorkflowStats(req.user!.id);
      res.json({ status: "success", data: stats });
    } catch (error) { next(error); }
  },

  async getEditors(req: Request, res: Response, next: NextFunction) {
    try {
      const editors = await workflowRepository.getEditors();
      res.json({ status: "success", data: editors });
    } catch (error) { next(error); }
  },

  async getEditorialArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, authorId, categoryId, assignedEditorId, search, page = "1", limit = "20" } = req.query as Record<string, string | undefined>;
      const where: Prisma.ArticleWhereInput = {};

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
        ];
      }
      if (status && status !== "ALL") where.status = status as $Enums.ArticleStatus;
      if (authorId) where.authorId = authorId;
      if (categoryId) where.categoryId = parseInt(categoryId as string);
      if (assignedEditorId) where.assignedEditorId = assignedEditorId;

      if (req.user!.role.name === "Journalist") {
        where.authorId = req.user!.id;
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [articles, total] = await Promise.all([
        prisma.article.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip,
          take: limitNum,
          include: {
            category: { select: { id: true, name: true, slug: true } },
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            assignedEditor: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        }),
        prisma.article.count({ where }),
      ]);

      res.json({
        status: "success",
        data: {
          articles,
          pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
        },
      });
    } catch (error) { next(error); }
  },
};

