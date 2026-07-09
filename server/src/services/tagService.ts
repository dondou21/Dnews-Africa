import { tagRepository } from "../repositories/tagRepository";
import { AppError } from "../middlewares/errorHandler";

export const tagService = {
  async getAll() {
    return tagRepository.findAll();
  },

  async getById(id: number) {
    const tag = await tagRepository.findById(id);
    if (!tag) throw new AppError("Tag not found", 404);
    return tag;
  },

  async create(data: { name: string; slug: string }) {
    const existing = await tagRepository.findByName(data.name);
    if (existing) throw new AppError("Tag with this name already exists", 409);
    const existingSlug = await tagRepository.findBySlug(data.slug);
    if (existingSlug) throw new AppError("Tag with this slug already exists", 409);
    return tagRepository.create(data);
  },

  async update(id: number, data: { name?: string; slug?: string }) {
    const tag = await tagRepository.findById(id);
    if (!tag) throw new AppError("Tag not found", 404);

    if (data.name) {
      const existing = await tagRepository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new AppError("Tag with this name already exists", 409);
      }
    }
    if (data.slug) {
      const existing = await tagRepository.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new AppError("Tag with this slug already exists", 409);
      }
    }

    return tagRepository.update(id, data);
  },

  async delete(id: number) {
    const tag = await tagRepository.findById(id);
    if (!tag) throw new AppError("Tag not found", 404);
    return tagRepository.delete(id);
  },
};
