import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import { config } from "../config";
import { userRepository } from "../repositories/userRepository";
import { AppError } from "../middlewares/errorHandler";

function stripPassword(user: any) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export const authService = {
  async register(data: { firstName: string; lastName: string; email: string; password: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError("Email already in use", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const journalistRole = await prisma.role.findUnique({ where: { name: "Journalist" } });
    if (!journalistRole) {
      throw new AppError("Default role not found", 500);
    }

    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      roleId: journalistRole.id,
    });

    return stripPassword(user);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId, roleName: user.role.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  },

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return stripPassword(user);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError("Current password is incorrect", 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.update(userId, { passwordHash });
  },
};
