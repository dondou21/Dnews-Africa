import { $Enums } from "@prisma/client";
import prisma from "../utils/prisma";
import type { Prisma } from "@prisma/client";

export interface CampaignQueryParams {
  page: number;
  limit: number;
  sort?: string;
  status?: string;
  search?: string;
}

const campaignInclude = {
  createdBy: { select: { id: true, firstName: true, lastName: true } },
  updatedBy: { select: { id: true, firstName: true, lastName: true } },
  _count: { select: { recipients: true } },
} as const;

export const campaignRepository = {
  findAll: (params: CampaignQueryParams) => {
    const where: Prisma.NewsletterCampaignWhereInput = {};

    if (params.status && params.status !== "ALL") {
      where.status = params.status as $Enums.CampaignStatus;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { subject: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.NewsletterCampaignOrderByWithRelationInput =
      params.sort === "oldest"
        ? { createdAt: "asc" as const }
        : params.sort === "title_asc"
          ? { title: "asc" as const }
          : params.sort === "title_desc"
            ? { title: "desc" as const }
            : { createdAt: "desc" as const };

    const skip = (params.page - 1) * params.limit;

    return Promise.all([
      prisma.newsletterCampaign.findMany({
        where,
        orderBy,
        skip,
        take: params.limit,
        include: campaignInclude,
      }),
      prisma.newsletterCampaign.count({ where }),
    ]);
  },

  findById: (id: string) =>
    prisma.newsletterCampaign.findUnique({
      where: { id },
      include: {
        ...campaignInclude,
        recipients: {
          include: {
            subscriber: { select: { id: true, email: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    }),

  findBySlug: (slug: string) =>
    prisma.newsletterCampaign.findUnique({ where: { slug } }),

  create: (data: Prisma.NewsletterCampaignCreateInput) =>
    prisma.newsletterCampaign.create({ data, include: campaignInclude }),

  update: (id: string, data: Prisma.NewsletterCampaignUpdateInput) =>
    prisma.newsletterCampaign.update({
      where: { id },
      data,
      include: campaignInclude,
    }),

  delete: (id: string) =>
    prisma.newsletterCampaign.update({
      where: { id },
      data: { status: "CANCELLED" },
    }),

  countByStatus: () =>
    Promise.all([
      prisma.newsletterCampaign.count(),
      prisma.newsletterCampaign.count({ where: { status: "DRAFT" } }),
      prisma.newsletterCampaign.count({ where: { status: "SCHEDULED" } }),
      prisma.newsletterCampaign.count({ where: { status: "SENDING" } }),
      prisma.newsletterCampaign.count({ where: { status: "SENT" } }),
    ]),

  findActiveRecipients: () =>
    prisma.newsletterSubscriber.findMany({
      where: { status: "ACTIVE", verified: true },
      select: { id: true, email: true, name: true },
    }),

  createRecipients: (data: { campaignId: string; subscriberId: string }[]) =>
    prisma.newsletterCampaignRecipient.createMany({ data }),

  findPendingRecipients: (campaignId: string, take: number) =>
    prisma.newsletterCampaignRecipient.findMany({
      where: { campaignId, status: "PENDING" },
      take,
      include: { subscriber: true },
    }),

  updateRecipient: (id: string, data: Prisma.NewsletterCampaignRecipientUpdateInput) =>
    prisma.newsletterCampaignRecipient.update({ where: { id }, data }),

  countRecipientsByStatus: (campaignId: string) =>
    Promise.all([
      prisma.newsletterCampaignRecipient.count({ where: { campaignId, status: "PENDING" } }),
      prisma.newsletterCampaignRecipient.count({ where: { campaignId, status: "SENT" } }),
      prisma.newsletterCampaignRecipient.count({ where: { campaignId, status: "FAILED" } }),
    ]),
};
