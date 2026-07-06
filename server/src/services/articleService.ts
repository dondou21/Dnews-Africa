import { articleRepository, ArticleQueryParams, CreateArticleInput, UpdateArticleInput } from "../repositories/articleRepository";
import { AppError } from "../middlewares/errorHandler";

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

  async create(data: CreateArticleInput) {
    return articleRepository.create(data);
  },

  async update(id: string, data: UpdateArticleInput) {
    const existing = await articleRepository.findById(id);
    if (!existing) {
      throw new AppError("Article not found", 404);
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
