import { categoryRepository } from "../repositories/categoryRepository";
import { AppError } from "../middlewares/errorHandler";
import { formatArticleList } from "../utils/formatArticle";

export const categoryService = {
  async getAll() {
    return categoryRepository.findAll();
  },

  async getParents() {
    return categoryRepository.findParents();
  },

  async getBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw new AppError("Category not found", 404);
    return category;
  },

  async getById(id: number) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError("Category not found", 404);
    return category;
  },

  async create(data: { name: string; slug: string; description?: string; parentId?: number | null }) {
    const existing = await categoryRepository.findByName(data.name);
    if (existing) throw new AppError("Category with this name already exists", 409);
    const existingSlug = await categoryRepository.findBySlug(data.slug);
    if (existingSlug) throw new AppError("Category with this slug already exists", 409);
    if (data.parentId) {
      const parent = await categoryRepository.findById(data.parentId);
      if (!parent) throw new AppError("Parent category not found", 404);
    }
    return categoryRepository.create(data);
  },

  async update(id: number, data: { name?: string; slug?: string; description?: string; parentId?: number | null }) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError("Category not found", 404);

    if (data.name) {
      const existing = await categoryRepository.findByName(data.name);
      if (existing && existing.id !== id) throw new AppError("Category with this name already exists", 409);
    }
    if (data.slug) {
      const existing = await categoryRepository.findBySlug(data.slug);
      if (existing && existing.id !== id) throw new AppError("Category with this slug already exists", 409);
    }
    if (data.parentId) {
      if (data.parentId === id) throw new AppError("A category cannot be its own parent", 400);
      const parent = await categoryRepository.findById(data.parentId);
      if (!parent) throw new AppError("Parent category not found", 404);
    }

    return categoryRepository.update(id, data);
  },

  async delete(id: number) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new AppError("Category not found", 404);
    const childCount = category._count?.children ?? 0;
    if (childCount > 0) {
      throw new AppError("Cannot delete a category that has subcategories. Remove or reassign subcategories first.", 400);
    }
    return categoryRepository.delete(id);
  },

  async getArticlesBySlug(slug: string) {
    const result = await categoryRepository.findArticlesBySlug(slug);
    if (!result) throw new AppError("Category not found", 404);

    const articles = [...(result.articles || [])];
    for (const child of result.children || []) {
      articles.push(...(child.articles || []));
    }
    articles.sort((a, b) => {
      const dateA = a.publishedAt?.getTime() ?? 0;
      const dateB = b.publishedAt?.getTime() ?? 0;
      return dateB - dateA;
    });

    return formatArticleList(articles);
  },

  async getDescendantSlugs(slug: string): Promise<string[]> {
    return categoryRepository.findDescendantSlugs(slug);
  },
};
