import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma";

export interface UpsertDraftInput {
  data: Record<string, unknown>;
  articleId?: string | null;
}

export const draftRepository = {
  async findByUserAndKey(userId: string, formKey: string) {
    return prisma.draft.findUnique({
      where: { userId_formKey: { userId, formKey } },
    });
  },

  async upsert(userId: string, formKey: string, input: UpsertDraftInput) {
    const data = input.data as Prisma.InputJsonObject;
    const articleId = input.articleId ?? null;

    return prisma.draft.upsert({
      where: { userId_formKey: { userId, formKey } },
      update: { data, articleId },
      create: { userId, formKey, data, articleId },
    });
  },

  async delete(userId: string, formKey: string) {
    return prisma.draft.deleteMany({ where: { userId, formKey } });
  },
};
