import { $Enums } from "@prisma/client";
import prisma from "../utils/prisma";
import type { Prisma } from "@prisma/client";

export interface NewsletterQueryParams {
  page: number;
  limit: number;
  sort?: string;
  status?: string;
  source?: string;
  search?: string;
}

export const newsletterRepository = {
  findByEmail: (email: string) =>
    prisma.newsletterSubscriber.findUnique({ where: { email } }),

  findByVerificationToken: (token: string) =>
    prisma.newsletterSubscriber.findFirst({ where: { verificationToken: token } }),

  create: (data: Prisma.NewsletterSubscriberCreateInput) =>
    prisma.newsletterSubscriber.create({ data }),

  findAll: (params: NewsletterQueryParams) => {
    const where: Prisma.NewsletterSubscriberWhereInput = {};

    if (params.status && params.status !== "ALL") {
      where.status = params.status as $Enums.NewsletterStatus;
    }

    if (params.source && params.source !== "ALL") {
      where.source = params.source as $Enums.NewsletterSource;
    }

    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: "insensitive" } },
        { name: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.NewsletterSubscriberOrderByWithRelationInput =
      params.sort === "oldest"
        ? { subscribedAt: "asc" as const }
        : params.sort === "email_asc"
          ? { email: "asc" as const }
          : params.sort === "email_desc"
            ? { email: "desc" as const }
            : { subscribedAt: "desc" as const };

    const skip = (params.page - 1) * params.limit;

    return Promise.all([
      prisma.newsletterSubscriber.findMany({ where, orderBy, skip, take: params.limit }),
      prisma.newsletterSubscriber.count({ where }),
    ]);
  },

  findById: (id: string) =>
    prisma.newsletterSubscriber.findUnique({ where: { id } }),

  update: (id: string, data: Prisma.NewsletterSubscriberUpdateInput) =>
    prisma.newsletterSubscriber.update({ where: { id }, data }),

  delete: (id: string) =>
    prisma.newsletterSubscriber.delete({ where: { id } }),

  countByStatus: () =>
    Promise.all([
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
      prisma.newsletterSubscriber.count({ where: { status: "PENDING" } }),
      prisma.newsletterSubscriber.count({ where: { status: "BLOCKED" } }),
      prisma.newsletterSubscriber.count({ where: { status: "UNSUBSCRIBED" } }),
    ]),
};
