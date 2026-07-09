import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { config } from "../config";

export function generateToken(user: {
  id: string;
  roleId: number;
  role: { name: string };
}) {
  return jwt.sign(
    { userId: user.id, roleId: user.roleId, roleName: user.role.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as any }
  );
}

export async function createTestUser(roleName: string) {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new Error(`Role ${roleName} not found`);

  const suffix = Date.now();
  const user = await prisma.user.create({
    data: {
      email: `test-${suffix}@example.com`,
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "Test",
      lastName: roleName,
      roleId: role.id,
    },
    include: { role: true },
  });

  const token = generateToken(user);

  return { user, token };
}

export async function cleanupTestData() {
  await prisma.articleTag.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.media.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { startsWith: "test-" } } });
}
