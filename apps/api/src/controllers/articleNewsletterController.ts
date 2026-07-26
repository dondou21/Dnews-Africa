import { z } from "zod";
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AppError } from "../middlewares/errorHandler";
import { articleNewsletterService } from "../services/articleNewsletterService";
import { buildArticleEmail } from "../services/emailTemplates";
import { emailService } from "../services/emailService";
import prisma from "../utils/prisma";

export const articleNewsletterController = {
  listDeliveries: asyncHandler(async (req: Request, res: Response) => {
    const query = z.object({
      page: z.coerce.number().int().positive().optional().default(1),
      limit: z.coerce.number().int().positive().max(100).optional().default(20),
      search: z.string().optional(),
      status: z.string().optional(),
    }).parse(req.query);

    const where: any = {};
    if (query.search) {
      where.article = { title: { contains: query.search, mode: "insensitive" } };
    }
    if (query.status && query.status !== "ALL") {
      where.status = query.status;
    }

    const [deliveries, total] = await Promise.all([
      prisma.articleNewsletterDelivery.findMany({
        where,
        include: {
          article: { select: { id: true, title: true, slug: true, publishedAt: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.articleNewsletterDelivery.count({ where }),
    ]);

    res.json({
      data: deliveries.map((d) => ({
        id: d.id,
        articleId: d.articleId,
        articleTitle: d.article.title,
        articleSlug: d.article.slug,
        articlePublishedAt: d.article.publishedAt,
        articleStatus: d.article.status,
        status: d.status,
        totalRecipients: d.totalRecipients,
        totalSent: d.totalSent,
        totalFailed: d.totalFailed,
        sentAt: d.sentAt,
        lastAttemptAt: d.lastAttemptAt,
        createdAt: d.createdAt,
        deliveryPercentage: d.totalRecipients > 0
          ? Math.round((d.totalSent / d.totalRecipients) * 100)
          : 0,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  }),

  preview: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        title: true,
        slug: true,
        summary: true,
        publishedAt: true,
        featuredImage: { select: { url: true, alt: true } },
        category: { select: { name: true } },
        author: { select: { firstName: true, lastName: true } },
      },
    });

    if (!article) {
      throw new AppError("Article not found", 404);
    }

    const publishedDate = article.publishedAt
      ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(article.publishedAt))
      : undefined;

    const html = buildArticleEmail(
      {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        category: article.category?.name ?? undefined,
        author: article.author ? `${article.author.firstName} ${article.author.lastName}`.trim() : undefined,
        publishedAt: publishedDate,
        featuredImageUrl: article.featuredImage?.url ?? undefined,
        featuredImageAlt: article.featuredImage?.alt ?? undefined,
      },
      "https://dnewsafrica.com/newsletter/unsubscribe?token=preview",
    );

    res.json({ html, subject: article.title });
  }),

  sendTest: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = z.object({ email: z.string().email() }).parse(req.body);
    const user = (req as any).user;

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        title: true,
        slug: true,
        summary: true,
        publishedAt: true,
        featuredImage: { select: { url: true, alt: true } },
        category: { select: { name: true } },
        author: { select: { firstName: true, lastName: true } },
      },
    });

    if (!article) {
      throw new AppError("Article not found", 404);
    }

    const publishedDate = article.publishedAt
      ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(article.publishedAt))
      : undefined;

    await emailService.sendArticleEmail(
      body.email,
      {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        category: article.category?.name ?? undefined,
        author: article.author ? `${article.author.firstName} ${article.author.lastName}`.trim() : undefined,
        publishedAt: publishedDate,
        featuredImageUrl: article.featuredImage?.url ?? undefined,
        featuredImageAlt: article.featuredImage?.alt ?? undefined,
      },
      "test-unsubscribe-token",
    );

    res.json({ message: `Test email sent to ${body.email}` });
  }),

  getDelivery: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const delivery = await prisma.articleNewsletterDelivery.findUnique({
      where: { articleId: id },
      include: {
        recipients: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
            sentAt: true,
            failedAt: true,
            errorMessage: true,
          },
          orderBy: { createdAt: "desc" },
          take: 200,
        },
      },
    });

    if (!delivery) {
      res.json(null);
      return;
    }

    const stats = {
      total: delivery.totalRecipients,
      sent: delivery.totalSent,
      failed: delivery.totalFailed,
      pending: delivery.totalRecipients - delivery.totalSent - delivery.totalFailed,
    };

    res.json({
      ...delivery,
      stats,
    });
  }),
};
