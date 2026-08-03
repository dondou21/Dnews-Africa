import prisma from "../utils/prisma";
import { cache } from "../utils/cache";
import { stripPassword } from "../utils/userUtils";
import type { Prisma } from "@prisma/client";

const USER_TTL = 60 * 1000;
const AUTHORS_KEY = "users:authors";
const userKey = (id: string) => `users:${id}`;

export type PublicUser = Omit<Prisma.UserGetPayload<{ include: { role: true } }>, "passwordHash">;

const authorSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  email: true,
  role: { select: { id: true, name: true } },
} as const;

export const userRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({
      where: { email },
      include: { role: true },
    }),

  findById: async (id: string): Promise<PublicUser | null> => {
    const cached = cache.get<PublicUser>(userKey(id));
    if (cached !== undefined) return cached;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) return null;
    return cache.set(userKey(id), stripPassword(user) as PublicUser, USER_TTL);
  },

  findByIdWithCredentials: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      include: { role: true },
    }),

  create: async (data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    roleId: number;
  }) => {
    const user = await prisma.user.create({
      data,
      include: { role: true },
    });
    cache.del(AUTHORS_KEY);
    cache.del(userKey(user.id));
    return user;
  },

  findAll: () =>
    prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" },
    }),

  update: async (id: string, data: Record<string, unknown>) => {
    const user = await prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
    cache.del(AUTHORS_KEY);
    cache.del(userKey(id));
    return user;
  },

  delete: async (id: string) => {
    const result = await prisma.user.delete({ where: { id } });
    cache.del(AUTHORS_KEY);
    cache.del(userKey(id));
    return result;
  },

  findAuthors: () =>
    cache.wrap(AUTHORS_KEY, USER_TTL, () =>
      prisma.user.findMany({
        where: {
          role: { name: { in: ["Admin", "Editor", "Chief Editor", "Journalist"] } },
          isActive: true,
        },
        select: authorSelect,
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      })
    ),
};
