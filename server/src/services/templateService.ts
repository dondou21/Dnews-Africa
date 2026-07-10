import { templateRepository } from "../repositories/templateRepository";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../utils/logger";
import type { AuthenticatedUser } from "../types/express";

export const templateService = {
  async getAll() {
    return templateRepository.findAll();
  },

  async getById(id: string) {
    const template = await templateRepository.findById(id);
    if (!template) throw new AppError("Template not found", 404);
    return template;
  },

  async create(data: {
    name: string;
    description?: string;
    subject: string;
    content: string;
    thumbnail?: string;
    isDefault?: boolean;
  }, user: AuthenticatedUser) {
    let isDefault = data.isDefault || false;
    if (isDefault) {
      await templateRepository.unsetDefault();
    }

    const template = await templateRepository.create({
      name: data.name,
      description: data.description || null,
      subject: data.subject,
      content: data.content,
      thumbnail: data.thumbnail || null,
      isDefault,
      createdBy: { connect: { id: user.id } },
    });

    logger.info("TemplateService", "Template created", { id: template.id, name: data.name });
    return template;
  },

  async update(id: string, data: {
    name?: string;
    description?: string;
    subject?: string;
    content?: string;
    thumbnail?: string;
    isDefault?: boolean;
  }, user: AuthenticatedUser) {
    const existing = await templateRepository.findById(id);
    if (!existing) throw new AppError("Template not found", 404);

    if (data.isDefault) {
      await templateRepository.unsetDefault();
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    const template = await templateRepository.update(id, updateData);
    logger.info("TemplateService", "Template updated", { id });
    return template;
  },

  async delete(id: string) {
    const existing = await templateRepository.findById(id);
    if (!existing) throw new AppError("Template not found", 404);
    await templateRepository.delete(id);
    logger.info("TemplateService", "Template deleted", { id });
  },

  async duplicate(id: string, user: AuthenticatedUser) {
    const original = await templateRepository.findById(id);
    if (!original) throw new AppError("Template not found", 404);

    const newName = `${original.name} (Copy)`;
    const template = await templateRepository.duplicate(id, newName, user.id);
    if (!template) throw new AppError("Failed to duplicate template", 500);
    logger.info("TemplateService", "Template duplicated", { originalId: id, newId: template.id });
    return template;
  },
};
