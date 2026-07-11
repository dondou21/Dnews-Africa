import prisma from "../utils/prisma";
import type { Prisma } from "@prisma/client";

export const adCampaignRepository = {
  findAll: (params: { page: number; limit: number; search?: string; status?: string; advertiserId?: string }) => {
    const where: Prisma.AdCampaignWhereInput = {};
    if (params.search) where.name = { contains: params.search, mode: "insensitive" };
    if (params.status && params.status !== "ALL") where.status = params.status;
    if (params.advertiserId) where.advertiserId = params.advertiserId;

    const skip = (params.page - 1) * params.limit;
    return Promise.all([
      prisma.adCampaign.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
        include: {
          advertiser: { select: { id: true, companyName: true } },
          _count: { select: { ads: true } },
        },
      }),
      prisma.adCampaign.count({ where }),
    ]);
  },

  findById: (id: string) =>
    prisma.adCampaign.findUnique({
      where: { id },
      include: {
        advertiser: { select: { id: true, companyName: true } },
        _count: { select: { ads: true } },
        ads: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    }),

  create: (data: Prisma.AdCampaignCreateInput) =>
    prisma.adCampaign.create({ data }),

  update: (id: string, data: Prisma.AdCampaignUpdateInput) =>
    prisma.adCampaign.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.adCampaign.delete({ where: { id } }),
};
