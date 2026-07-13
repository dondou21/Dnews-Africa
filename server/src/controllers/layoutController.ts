import { Request, Response } from "express";
import { layoutService } from "../services/layoutService";
import { AppError } from "../middlewares/errorHandler";
import { createLayoutSchema, updateLayoutSchema, duplicateLayoutSchema } from "../validators/layoutValidator";
import { asyncHandler } from "../middlewares/asyncHandler";

const parsePagination = (query: Record<string, unknown>) => ({
  page: parseInt(query.page as string) || 1,
  limit: parseInt(query.limit as string) || 20,
  search: query.search as string,
  status: query.status as string,
});

export const layoutController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, status } = parsePagination(req.query);
    const result = await layoutService.getAll(page, limit, search, status);
    res.json({ status: "success", data: result });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const layout = await layoutService.getById(id);
    res.json({ status: "success", data: layout });
  }),

  getBySlug: asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const layout = await layoutService.getBySlug(slug);
    res.json({ status: "success", data: layout });
  }),

  getPublished: asyncHandler(async (_req: Request, res: Response) => {
    const layout = await layoutService.getPublished();
    res.json({ status: "success", data: layout });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const parsed = createLayoutSchema.parse(req.body);
    const layout = await layoutService.create(parsed, req.user!);
    res.status(201).json({ status: "success", data: layout });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsed = updateLayoutSchema.parse(req.body);
    const layout = await layoutService.update(id, parsed, req.user!);
    res.json({ status: "success", data: layout });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await layoutService.delete(id);
    res.json({ status: "success", data: null });
  }),

  publish: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const layout = await layoutService.publish(id);
    res.json({ status: "success", data: layout });
  }),

  duplicate: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const parsed = duplicateLayoutSchema.parse(req.body);
    const layout = await layoutService.duplicate(id, parsed, req.user!);
    res.status(201).json({ status: "success", data: layout });
  }),

  saveSections: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { sections } = req.body;
    if (!Array.isArray(sections)) throw new AppError("Sections must be an array", 400);
    const layout = await layoutService.saveSections(id, sections);
    res.json({ status: "success", data: layout });
  }),
};
