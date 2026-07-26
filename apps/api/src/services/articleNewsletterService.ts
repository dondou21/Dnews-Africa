import prisma from "../utils/prisma";
import { logger } from "../utils/logger";
import { emailService } from "./emailService";
import type { ArticleEmailData } from "./emailTemplates";

const BATCH_SIZE = 50;

export const articleNewsletterService = {
  async sendArticleNewsletter(articleId: string): Promise<void> {
    try {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          status: true,
          sendNewsletter: true,
          newsletterSentAt: true,
          publishedAt: true,
          featuredImage: { select: { url: true, alt: true } },
          category: { select: { name: true } },
          author: { select: { firstName: true, lastName: true } },
        },
      });

      if (!article) {
        logger.warn("ArticleNewsletter", "Article not found", { articleId });
        return;
      }

      if (article.status !== "PUBLISHED") {
        logger.info("ArticleNewsletter", "Article not published, skipping", { articleId, status: article.status });
        return;
      }

      if (!article.sendNewsletter) {
        logger.info("ArticleNewsletter", "Newsletter disabled for article", { articleId });
        return;
      }

      if (article.newsletterSentAt) {
        logger.info("ArticleNewsletter", "Newsletter already sent for article", { articleId, sentAt: article.newsletterSentAt });
        return;
      }

      const activeSubscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, email: true, name: true, unsubscribeToken: true },
      });

      if (activeSubscribers.length === 0) {
        logger.info("ArticleNewsletter", "No active subscribers", { articleId });
        await prisma.article.update({
          where: { id: articleId },
          data: { newsletterSentAt: new Date() },
        });
        return;
      }

      const delivery = await prisma.articleNewsletterDelivery.create({
        data: {
          articleId,
          status: "SENDING",
          totalRecipients: activeSubscribers.length,
        },
      });

      await prisma.article.update({
        where: { id: articleId },
        data: { newsletterSentAt: new Date() },
      });

      const publishedDate = article.publishedAt
        ? new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }).format(new Date(article.publishedAt))
        : undefined;

      const articleEmail: ArticleEmailData = {
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        category: article.category?.name ?? undefined,
        author: article.author
          ? `${article.author.firstName} ${article.author.lastName}`.trim()
          : undefined,
        publishedAt: publishedDate,
        featuredImageUrl: article.featuredImage?.url ?? undefined,
        featuredImageAlt: article.featuredImage?.alt ?? undefined,
      };

      let sent = 0;
      let failed = 0;

      for (let i = 0; i < activeSubscribers.length; i += BATCH_SIZE) {
        const batch = activeSubscribers.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map(async (subscriber) => {
            try {
              await emailService.sendArticleEmail(
                subscriber.email,
                articleEmail,
                subscriber.unsubscribeToken!,
              );

              await prisma.articleNewsletterRecipient.create({
                data: {
                  deliveryId: delivery.id,
                  subscriberId: subscriber.id,
                  email: subscriber.email,
                  name: subscriber.name,
                  status: "SENT",
                  sentAt: new Date(),
                },
              });

              sent++;
            } catch (err) {
              await prisma.articleNewsletterRecipient.create({
                data: {
                  deliveryId: delivery.id,
                  subscriberId: subscriber.id,
                  email: subscriber.email,
                  name: subscriber.name,
                  status: "FAILED",
                  failedAt: new Date(),
                  errorMessage: String(err),
                },
              });

              failed++;
              logger.error("ArticleNewsletter", "Failed to send article email", {
                articleId,
                email: subscriber.email,
                error: String(err),
              });
            }
          }),
        );
      }

      const finalStatus = failed === 0 ? "SENT" : sent > 0 ? "PARTIAL" : "FAILED";

      await prisma.articleNewsletterDelivery.update({
        where: { id: delivery.id },
        data: {
          status: finalStatus,
          totalSent: sent,
          totalFailed: failed,
          sentAt: failed === 0 ? new Date() : undefined,
          lastAttemptAt: new Date(),
        },
      });

      logger.info("ArticleNewsletter", "Newsletter delivery complete", {
        articleId,
        title: article.title,
        total: activeSubscribers.length,
        sent,
        failed,
      });
    } catch (err) {
      logger.error("ArticleNewsletter", "Failed to trigger newsletter", { articleId, error: String(err) });
    }
  },
};
