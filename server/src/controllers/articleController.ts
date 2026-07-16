import { z } from "zod";
import { Request, Response } from "express";
import { articleService } from "../services/articleService";
import { createArticleSchema, updateArticleSchema, articleQuerySchema } from "../validators/articleValidator";
import { AppError, ZodValidationError } from "../middlewares/errorHandler";
import { asyncHandler } from "../middlewares/asyncHandler";

function parseZod(schema: z.ZodSchema, data: unknown) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));
    throw new ZodValidationError(errors);
  }
  return parsed.data;
}

export const articleController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const parsed = parseZod(articleQuerySchema, req.query);
    const result = await articleService.getAll(parsed);
    res.json({ status: "success", data: result });
  }),

  getAllAdmin: asyncHandler(async (req: Request, res: Response) => {
    const parsed = parseZod(articleQuerySchema, req.query);
    const status = req.query.status as string | undefined;
    const categoryId = parsed.categoryId;
    const result = await articleService.getAllAdmin({ ...parsed, status, categoryId }, req.user!);
    res.json({ status: "success", data: result });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const article = await articleService.getBySlug(slug);
    res.json({ status: "success", data: article });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = await articleService.getById(id, req.user);
    res.json({ status: "success", data: article });
  }),

  getFeatured: asyncHandler(async (_req: Request, res: Response) => {
    const articles = await articleService.getFeatured();
    res.json({ status: "success", data: articles });
  }),

  getLatest: asyncHandler(async (_req: Request, res: Response) => {
    const articles = await articleService.getLatest();
    res.json({ status: "success", data: articles });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = parseZod(createArticleSchema, req.body);
    const article = await articleService.create(parsed, req.user!);
    res.status(201).json({ status: "success", data: article });
  }),

  submitForReview: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = await articleService.submitForReview(id, req.user!);
    res.json({ status: "success", data: article });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsed = parseZod(updateArticleSchema, req.body);
    const article = await articleService.update(id, parsed, req.user!);
    res.json({ status: "success", data: article });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await articleService.delete(id, req.user!);
    res.json({ status: "success", data: null });
  }),
};
