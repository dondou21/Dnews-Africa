import { $Enums } from "@prisma/client";
import prisma from "../utils/prisma";
import type { Prisma } from "@prisma/client";

export const advertisementRepository = {
  findAll: (params: {
    page: number; limit: number; search?: string; status?: string; placement?: string; type?: string; advertiserId?: string; campaignId?: string;
  }) => {
    const where: Prisma.AdvertisementWhereInput = {};
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }
    if (params.status && params.status !== "ALL") where.status = params.status as $Enums.AdStatus;
    if (params.placement && params.placement !== "ALL") where.placement = params.placement as $Enums.AdPlacement;
    if (params.type && params.type !== "ALL") where.type = params.type as $Enums.AdType;
    if (params.advertiserId) where.advertiserId = params.advertiserId;
    if (params.campaignId) where.campaignId = params.campaignId;

    const skip = (params.page - 1) * params.limit;
    return Promise.all([
      prisma.advertisement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
        include: {
          advertiser: { select: { id: true, companyName: true } },
          campaign: { select: { id: true, name: true } },
          image: { select: { id: true, url: true, alt: true } },
          video: { select: { id: true, url: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.advertisement.count({ where }),
    ]);
  },

  findById: (id: string) =>
    prisma.advertisement.findUnique({
      where: { id },
      include: {
        advertiser: { select: { id: true, companyName: true, website: true } },
        campaign: { select: { id: true, name: true } },
        image: { select: { id: true, url: true, alt: true } },
        video: { select: { id: true, url: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    }),

  create: (data: Prisma.AdvertisementCreateInput) =>
    prisma.advertisement.create({ data }),

  update: (id: string, data: Prisma.AdvertisementUpdateInput) =>
    prisma.advertisement.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.advertisement.delete({ where: { id } }),

  incrementImpressions: (id: string) =>
    prisma.advertisement.update({ where: { id }, data: { impressions: { increment: 1 } } }),

  incrementClicks: (id: string) =>
    prisma.advertisement.update({ where: { id }, data: { clicks: { increment: 1 } } }),

  findActiveByPlacement: (placement: string, limit: number = 1) =>
    prisma.advertisement.findMany({
      where: {
        status: "ACTIVE",
        placement: placement as $Enums.AdPlacement,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
          { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
          { OR: [{ maxImpressions: null }, { impressions: { lt: prisma.advertisement.fields.maxImpressions } }] },
          { OR: [{ maxClicks: null }, { clicks: { lt: prisma.advertisement.fields.maxClicks } }] },
        ],
      },
      orderBy: [{ priority: "desc" }, { impressions: "asc" }],
      take: limit,
      include: { image: { select: { id: true, url: true, alt: true } } },
    }),

  getStats: () =>
    Promise.all([
      prisma.advertisement.count(),
      prisma.advertisement.count({ where: { status: "ACTIVE" } }),
      prisma.advertisement.count({ where: { status: "PAUSED" } }),
      prisma.advertisement.count({
        where: {
          status: "ACTIVE",
          endDate: { lte: new Date() },
        },
      }),
      prisma.advertisement.aggregate({ _sum: { impressions: true, clicks: true } }),
    ]),
};
