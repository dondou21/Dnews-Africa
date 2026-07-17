import { Request, Response, NextFunction } from "express";
import { userService } from "../services/userService";
import { createUserSchema, updateUserSchema } from "../validators/userValidator";
import { AppError } from "../middlewares/errorHandler";

export const userController = {
  async getAuthors(_req: Request, res: Response, next: NextFunction) {
    try {
      const authors = await userService.getAuthors();
      res.json({ status: "success", data: authors });
    } catch (error) {
      next(error);
    }
  },

  async createByAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const user = await userService.createByAdmin(parsed.data);
      res.status(201).json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  },

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAll();
      res.json({ status: "success", data: users });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getById(id, req.user!);
      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const user = await userService.update(id, parsed.data, req.user!);
      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await userService.delete(id, req.user!);
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },
};
