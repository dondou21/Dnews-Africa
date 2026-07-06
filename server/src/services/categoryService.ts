import { categoryRepository } from "../repositories/categoryRepository";
import { AppError } from "../middlewares/errorHandler";

export const categoryService = {
  async getAll() {
    return categoryRepository.findAll();
  },

  async getBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return category;
  },

  async getArticlesBySlug(slug: string) {
    const category = await categoryRepository.findArticlesBySlug(slug);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return category.articles;
  },
};
