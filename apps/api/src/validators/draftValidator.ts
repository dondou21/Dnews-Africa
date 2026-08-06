import { z } from "zod";

export const formKeySchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9:_-]+$/, "Invalid form key");

export const draftDataSchema = z
  .record(z.string(), z.unknown())
  .default({});

export const upsertDraftSchema = z.object({
  data: draftDataSchema,
  articleId: z.string().uuid().nullable().optional(),
});

export const draftParamsSchema = z.object({
  formKey: formKeySchema,
});
