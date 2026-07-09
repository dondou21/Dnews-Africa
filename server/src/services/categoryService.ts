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

  async getById(id: number) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError("Category not found", 404);
    return category;
  },

  async create(data: { name: string; slug: string; description?: string }) {
    const existing = await categoryRepository.findByName(data.name);
    if (existing) throw new AppError("Category with this name already exists", 409);
    const existingSlug = await categoryRepository.findBySlug(data.slug);
    if (existingSlug) throw new AppError("Category with this slug already exists", 409);
    return categoryRepository.create(data);
  },

  async update(id: number, data: { name?: string; slug?: string; description?: string }) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError("Category not found", 404);

    if (data.name) {
      const existing = await categoryRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new AppError("Category with this name already exists", 409);
      }
    }
    if (data.slug) {
      const existing = await categoryRepository.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new AppError("Category with this slug already exists", 409);
      }
    }

    return categoryRepository.update(id, data);
  },

  async delete(id: number) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError("Category not found", 404);
    return categoryRepository.delete(id);
  },

  async getArticlesBySlug(slug: string) {
    const category = await categoryRepository.findArticlesBySlug(slug);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return category.articles;
  },
};
