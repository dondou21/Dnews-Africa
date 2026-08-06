import { draftRepository, UpsertDraftInput } from "../repositories/draftRepository";

export const draftService = {
  async getDraft(userId: string, formKey: string) {
    const draft = await draftRepository.findByUserAndKey(userId, formKey);
    if (!draft) {
      return null;
    }
    return {
      id: draft.id,
      articleId: draft.articleId,
      data: draft.data,
      updatedAt: draft.updatedAt,
      createdAt: draft.createdAt,
    };
  },

  async saveDraft(userId: string, formKey: string, input: UpsertDraftInput) {
    const draft = await draftRepository.upsert(userId, formKey, input);
    return {
      id: draft.id,
      articleId: draft.articleId,
      data: draft.data,
      updatedAt: draft.updatedAt,
      createdAt: draft.createdAt,
    };
  },

  async deleteDraft(userId: string, formKey: string) {
    await draftRepository.delete(userId, formKey);
    return true;
  },
};
