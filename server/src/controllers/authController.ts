import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { registerSchema, loginSchema, changePasswordSchema } from "../validators/authValidator";
import { AppError } from "../middlewares/errorHandler";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const user = await authService.register(parsed.data);
      res.status(201).json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      const result = await authService.login(parsed.data.email, parsed.data.password);
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0].message, 400);
      }
      await authService.changePassword(
        req.user!.id,
        parsed.data.currentPassword,
        parsed.data.newPassword
      );
      res.json({ status: "success", data: null });
    } catch (error) {
      next(error);
    }
  },
};
