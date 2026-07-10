import { articleRepository, ArticleQueryParams, CreateArticleInput, UpdateArticleInput } from "../repositories/articleRepository";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedUser } from "../types/express";

export const articleService = {
  async getAll(params: ArticleQueryParams) {
    return articleRepository.findAllPublished(params);
  },

  async getAllAdmin(params: ArticleQueryParams & { status?: string }, user: AuthenticatedUser) {
    if (user.role.name === "Journalist") {
      return articleRepository.findAllByAuthor(user.id, params);
    }
    return articleRepository.findAllAdmin(params);
  },

  async getBySlug(slug: string) {
    const article = await articleRepository.findPublishedBySlug(slug);
    if (!article) {
      throw new AppError("Article not found", 404);
    }
    return article;
  },

  async getById(id: string) {
    const article = await articleRepository.findByIdWithDetails(id);
    if (!article) {
      throw new AppError("Article not found", 404);
    }
    return article;
  },

  async getFeatured() {
    return articleRepository.findFeatured();
  },

  async getLatest() {
    return articleRepository.findLatest();
  },

  async create(data: CreateArticleInput, user: AuthenticatedUser) {
    const createData = { ...data, authorId: user.id };

    if (user.role.name !== "Admin" && user.role.name !== "Editor") {
      createData.status = "DRAFT";
    }

    return articleRepository.create(createData);
  },

  async submitForReview(id: string, user: AuthenticatedUser) {
    const existing = await articleRepository.findById(id);
    if (!existing) {
      throw new AppError("Article not found", 404);
    }

    if (user.role.name === "Journalist" && existing.authorId !== user.id) {
      throw new AppError("You can only submit your own articles for review", 403);
    }

    if (existing.status !== "DRAFT") {
      throw new AppError("Only draft articles can be submitted for review", 400);
    }

    return articleRepository.update(id, { status: "PENDING_REVIEW" });
  },

  async update(id: string, data: UpdateArticleInput, user: AuthenticatedUser) {
    const existing = await articleRepository.findById(id);
    if (!existing) {
      throw new AppError("Article not found", 404);
    }

    if (user.role.name === "Journalist") {
      if (existing.authorId !== user.id) {
        throw new AppError("You can only update your own articles", 403);
      }
      if (existing.status !== "DRAFT") {
        throw new AppError("You can only edit articles in Draft status", 403);
      }
      if (data.status && data.status !== "DRAFT" && data.status !== "PENDING_REVIEW") {
        throw new AppError("You can only save as Draft or Submit for Review", 403);
      }
    }

    if (data.status === "PUBLISHED" && user.role.name !== "Admin" && user.role.name !== "Editor") {
      throw new AppError("Only editors and admins can publish articles", 403);
    }

    if (data.status === "ARCHIVED" && user.role.name !== "Admin" && user.role.name !== "Editor") {
      throw new AppError("Only editors and admins can archive articles", 403);
    }

    return articleRepository.update(id, data);
  },

  async delete(id: string, user: AuthenticatedUser) {
    const existing = await articleRepository.findById(id);
    if (!existing) {
      throw new AppError("Article not found", 404);
    }

    if (user.role.name === "Journalist") {
      if (existing.authorId !== user.id) {
        throw new AppError("You can only delete your own articles", 403);
      }
      if (existing.status !== "DRAFT") {
        throw new AppError("You can only delete articles in Draft status", 403);
      }
    }

    return articleRepository.delete(id);
  },
};
