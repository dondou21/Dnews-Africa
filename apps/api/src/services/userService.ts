import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { userRepository } from "../repositories/userRepository";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedUser } from "../types/express";
import { stripPassword } from "../utils/userUtils";

export const userService = {
  async getAll() {
    const users = await userRepository.findAll();
    return users.map(stripPassword);
  },

  async getAuthors() {
    return userRepository.findAuthors();
  },

  async createByAdmin(data: { firstName: string; lastName: string; email: string; password: string; roleId: number }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError("Email already in use", 409);
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      roleId: data.roleId,
    });
    return stripPassword(user);
  },

  async getById(id: string, currentUser: AuthenticatedUser) {
    if (id !== currentUser.id && currentUser.role.name !== "Admin") {
      throw new AppError("Access denied", 403);
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return stripPassword(user);
  },

  async update(id: string, data: Record<string, unknown>, currentUser: AuthenticatedUser) {
    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new AppError("User not found", 404);
    }

    if (id !== currentUser.id && currentUser.role.name !== "Admin") {
      throw new AppError("Access denied", 403);
    }

    if (currentUser.role.name !== "Admin") {
      if (data.roleId !== undefined || data.isActive !== undefined) {
        throw new AppError("Only admins can change role or status", 403);
      }
      delete data.roleId;
      delete data.isActive;
    }

    if (data.roleId !== undefined && existing.roleId !== data.roleId) {
      const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } });
      if (adminRole && existing.roleId === adminRole.id) {
        const adminCount = await prisma.user.count({ where: { roleId: adminRole.id } });
        if (adminCount <= 1) {
          throw new AppError("Cannot change role of the last admin", 403);
        }
      }
    }

    if (data.isActive === false && id === currentUser.id) {
      throw new AppError("Cannot deactivate your own account", 403);
    }

    const user = await userRepository.update(id, data);
    return stripPassword(user);
  },

  async delete(id: string, currentUser: AuthenticatedUser) {
    if (id === currentUser.id) {
      throw new AppError("Cannot delete your own account", 403);
    }

    const existing = await userRepository.findById(id);
    if (!existing) {
      throw new AppError("User not found", 404);
    }

    const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } });
    if (adminRole && existing.roleId === adminRole.id) {
      const adminCount = await prisma.user.count({ where: { roleId: adminRole.id } });
      if (adminCount <= 1) {
        throw new AppError("Cannot delete the last admin", 403);
      }
    }

    try {
      await userRepository.delete(id);
    } catch {
      throw new AppError("Cannot delete user with existing articles or comments", 409);
    }
  },
};
