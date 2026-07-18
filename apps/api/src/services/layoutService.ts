import { layoutRepository } from "../repositories/layoutRepository";
import { AppError } from "../middlewares/errorHandler";
import type { AuthenticatedUser } from "../types/express";

export const layoutService = {
  async getAll(page: number, limit: number, search?: string, status?: string) {
    return layoutRepository.findAll({ page, limit, search, status });
  },

  async getById(id: string) {
    const layout = await layoutRepository.findById(id);
    if (!layout) throw new AppError("Layout not found", 404);
    return layout;
  },

  async getBySlug(slug: string) {
    const layout = await layoutRepository.findBySlug(slug);
    if (!layout) throw new AppError("Layout not found", 404);
    return layout;
  },

  async getPublished() {
    const layout = await layoutRepository.findPublished();
    if (layout) return layout;
    const created = await layoutRepository.create({
      name: "Default Homepage", slug: "default-homepage",
      status: "PUBLISHED", isDefault: true, settings: {},
      createdById: "system",
    });
    return created;
  },

  async create(data: { name: string; slug: string; status?: string; isDefault?: boolean; scheduledAt?: string | null; settings?: any; sections?: any[] }, user: AuthenticatedUser) {
    if (data.isDefault) {
      const existing = await layoutRepository.findPublished();
      if (existing) {
        await layoutRepository.update(existing.id, { isDefault: false });
      }
    }
    const { sections, ...layoutData } = data;
    const layout = await layoutRepository.create({ ...layoutData, createdById: user.id });
    if (sections && sections.length > 0) {
      const saved = await layoutRepository.saveSections(layout.id, sections);
      return saved!;
    }
    return layout;
  },

  async update(id: string, data: Record<string, unknown>, user: AuthenticatedUser) {
    const existing = await layoutRepository.findById(id);
    if (!existing) throw new AppError("Layout not found", 404);

    if (data.isDefault === true && !existing.isDefault) {
      await layoutRepository.update(id, data);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sections, ...layoutFields } = data as Record<string, unknown>;
    let layout = await layoutRepository.update(id, layoutFields);
    if (sections) {
      layout = (await layoutRepository.saveSections(id, sections as any[]))!;
    }
    return layout;
  },

  async delete(id: string) {
    const existing = await layoutRepository.findById(id);
    if (!existing) throw new AppError("Layout not found", 404);
    if (existing.isDefault) throw new AppError("Cannot delete the default layout", 400);
    return layoutRepository.delete(id);
  },

  async publish(id: string) {
    const existing = await layoutRepository.findById(id);
    if (!existing) throw new AppError("Layout not found", 404);
    return layoutRepository.publish(id);
  },

  async duplicate(id: string, data: { name: string; slug: string }, user: AuthenticatedUser) {
    const existing = await layoutRepository.findById(id);
    if (!existing) throw new AppError("Layout not found", 404);
    const layout = await layoutRepository.create({
      name: data.name, slug: data.slug,
      status: "DRAFT", settings: existing.settings,
      createdById: user.id,
    });
    if (existing.sections.length > 0) {
      return (await layoutRepository.saveSections(layout.id, existing.sections.map((s) => ({
        type: s.type, title: s.title, subtitle: s.subtitle,
        position: s.position, settings: s.settings, visible: s.visible,
      }))))!;
    }
    return layout;
  },

  async saveSections(layoutId: string, sections: any[]) {
    return (await layoutRepository.saveSections(layoutId, sections))!;
  },
};
