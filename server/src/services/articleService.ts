import { articleRepository, ArticleQueryParams, CreateArticleInput, UpdateArticleInput } from "../repositories/articleRepository";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedUser } from "../types/express";

export const articleService = {
  async getAll(params: ArticleQueryParams) {
    return articleRepository.findAllPublished(params);
  },

  async getBySlug(slug: string) {
    const article = await articleRepository.findPublishedBySlug(slug);
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

    if (user.role.name !== "ADMIN" && user.role.name !== "EDITOR") {
      if (createData.status === "PUBLISHED") {
        createData.status = "DRAFT";
      }
    }

    return articleRepository.create(createData);
  },

  async update(id: string, data: UpdateArticleInput, user: AuthenticatedUser) {
    const existing = await articleRepository.findById(id);
    if (!existing) {
      throw new AppError("Article not found", 404);
    }

    if (user.role.name === "JOURNALIST" && existing.authorId !== user.id) {
      throw new AppError("You can only update your own articles", 403);
    }

    if (data.status === "PUBLISHED" && user.role.name !== "ADMIN" && user.role.name !== "EDITOR") {
      throw new AppError("Only editors and admins can publish articles", 403);
    }

    return articleRepository.update(id, data);
  },

  async delete(id: string) {
    const existing = await articleRepository.findById(id);
    if (!existing) {
      throw new AppError("Article not found", 404);
    }
    return articleRepository.delete(id);
  },
};
