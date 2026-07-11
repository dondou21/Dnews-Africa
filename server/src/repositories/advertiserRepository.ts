import prisma from "../utils/prisma";
import type { Prisma } from "@prisma/client";

export const advertiserRepository = {
  findAll: (params: { page: number; limit: number; search?: string; status?: string }) => {
    const where: Prisma.AdvertiserWhereInput = {};
    if (params.search) {
      where.OR = [
        { companyName: { contains: params.search, mode: "insensitive" } },
        { contactName: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }
    if (params.status && params.status !== "ALL") where.status = params.status;

    const skip = (params.page - 1) * params.limit;
    return Promise.all([
      prisma.advertiser.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
        include: { _count: { select: { ads: true, campaigns: true } } },
      }),
      prisma.advertiser.count({ where }),
    ]);
  },

  findById: (id: string) =>
    prisma.advertiser.findUnique({
      where: { id },
      include: {
        _count: { select: { ads: true, campaigns: true } },
        campaigns: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    }),

  create: (data: Prisma.AdvertiserCreateInput) =>
    prisma.advertiser.create({ data }),

  update: (id: string, data: Prisma.AdvertiserUpdateInput) =>
    prisma.advertiser.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.advertiser.delete({ where: { id } }),

  list: () =>
    prisma.advertiser.findMany({
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true, status: true },
    }),
};
