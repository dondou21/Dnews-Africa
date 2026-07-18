import { Request, Response, NextFunction } from "express";
import { roleService } from "../services/roleService";

export const roleController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleService.getAll();
      res.json({ status: "success", data: roles });
    } catch (error) {
      next(error);
    }
  },
};
