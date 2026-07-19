import prisma from "../utils/prisma";
import { commentRepository } from "../repositories/commentRepository";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedUser } from "../types/express";

export const commentService = {
  async create(data: {
    name: string;
    email: string;
    content: string;
    articleId: string;
    user?: AuthenticatedUser;
  }) {
    const article = await prisma.article.findUnique({
      where: { id: data.articleId },
      select: { id: true, status: true },
    });

    if (!article) {
      throw new AppError("Article not found", 404);
    }

    if (article.status !== "PUBLISHED") {
      throw new AppError("Cannot comment on unpublished articles", 400);
    }

    return commentRepository.create({
      content: data.content,
      articleId: data.articleId,
      authorId: data.user?.id,
      guestName: data.user ? undefined : data.name,
      guestEmail: data.user ? undefined : data.email,
    });
  },

  async getByArticle(articleId: string) {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!article) {
      throw new AppError("Article not found", 404);
    }

    return commentRepository.findApprovedByArticleId(articleId);
  },

  async getById(id: string) {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }
    return comment;
  },

  async getAll() {
    return commentRepository.findAll();
  },

  async getPending() {
    return commentRepository.findPending();
  },

  async updateStatus(id: string, status: string) {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    return commentRepository.updateStatus(id, status);
  },

  async delete(id: string) {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new AppError("Comment not found", 404);
    }

    return commentRepository.delete(id);
  },
};