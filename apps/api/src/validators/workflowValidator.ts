import { z } from "zod";
import { ArticleStatus } from "@prisma/client";

export const submitForReviewSchema = z.object({
  changeReason: z.string().optional(),
});

export const approveArticleSchema = z.object({
  notes: z.string().optional(),
});

export const requestChangesSchema = z.object({
  notes: z.string().min(1, "Notes are required when requesting changes"),
  sectionReference: z.string().optional(),
});

export const rejectArticleSchema = z.object({
  notes: z.string().min(1, "Notes are required when rejecting"),
});

export const assignEditorSchema = z.object({
  editorId: z.string().uuid("Invalid editor ID"),
});

export const scheduleArticleSchema = z.object({
  scheduledAt: z.string().datetime("Invalid datetime format"),
}).superRefine((data, ctx) => {
  const date = new Date(data.scheduledAt);
  const now = new Date();
  now.setSeconds(0, 0);
  if (date <= now) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Scheduled time must be in the future. Select a time at least 1 minute ahead.", path: ["scheduledAt"] });
  }
});

export const createEditorialCommentSchema = z.object({
  comment: z.string().min(1, "Comment is required"),
  sectionReference: z.string().optional(),
  parentId: z.string().uuid().optional(),
});

export const resolveCommentSchema = z.object({
  resolved: z.boolean(),
});

export const createRevisionSchema = z.object({
  changeReason: z.string().min(1, "Change reason is required"),
});

export const restoreRevisionSchema = z.object({
  changeReason: z.string().min(1, "Change reason is required"),
});

export const changeStatusSchema = z.object({
  status: z.nativeEnum(ArticleStatus),
  notes: z.string().max(2000).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const compareRevisionsSchema = z.object({
  version1: z.coerce.number().int().positive(),
  version2: z.coerce.number().int().positive(),
});
