import crypto from "crypto";
import prisma from "../utils/prisma";
import { logger } from "../utils/logger";
import { emailService } from "./emailService";
import type { ArticleEmailData } from "./emailTemplates";

const BATCH_SIZE = 50;

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function categoryPreferencesMatch(
  preferences: unknown,
  articleCategoryId: number,
  categoryParentId?: number | null
): boolean {
  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
    return true;
  }

  const prefs = preferences as Record<string, unknown>;
  const keys = [String(articleCategoryId)];
  if (categoryParentId) {
    keys.push(String(categoryParentId));
  }

  return keys.every((key) => prefs[key] !== false);
}

export const articleNewsletterService = {
  async sendArticleNewsletter(articleId: string): Promise<void> {
    try {
      logger.info("ArticleNewsletter", "[Notification] Newsletter send triggered", { articleId });

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
          categoryId: true,
          featuredImage: { select: { url: true, alt: true } },
          category: { select: { id: true, name: true, parentId: true } },
          author: { select: { firstName: true, lastName: true } },
        },
      });

      if (!article) {
        logger.warn("ArticleNewsletter", "[Notification] Article not found", { articleId });
        return;
      }

      if (article.status !== "PUBLISHED") {
        logger.info("ArticleNewsletter", "[Notification] Article not published, skipping", {
          articleId,
          status: article.status,
        });
        return;
      }

      if (!article.sendNewsletter) {
        logger.info("ArticleNewsletter", "[Notification] Newsletter disabled for article", { articleId });
        return;
      }

      if (article.newsletterSentAt) {
        logger.info("ArticleNewsletter", "[Notification] Newsletter already completed for article", {
          articleId,
          sentAt: article.newsletterSentAt,
        });
        return;
      }

      let delivery = await prisma.articleNewsletterDelivery.findUnique({ where: { articleId } });
      if (delivery && delivery.status === "SENT") {
        logger.info("ArticleNewsletter", "[Notification] Newsletter already delivered", {
          articleId,
          deliveryId: delivery.id,
        });
        return;
      }

      const [subscribers, deliveredRecipients] = await Promise.all([
        prisma.newsletterSubscriber.findMany({
          where: { status: "ACTIVE", verified: true },
          select: {
            id: true,
            email: true,
            name: true,
            unsubscribeToken: true,
            preferences: true,
          },
        }),
        delivery
          ? prisma.articleNewsletterRecipient.findMany({
              where: { deliveryId: delivery.id, status: "SENT" },
              select: { subscriberId: true },
            })
          : Promise.resolve([]),
      ]);

      const alreadySentIds = new Set(deliveredRecipients.map((r) => r.subscriberId));

      const recipients: {
        id: string;
        email: string;
        name: string | null;
        unsubscribeToken: string;
      }[] = [];

      let alreadySentSkipped = 0;
      let tokenRepaired = 0;
      let preferencesSkipped = 0;

      for (const sub of subscribers) {
        if (alreadySentIds.has(sub.id)) {
          alreadySentSkipped++;
          continue;
        }

        let unsubscribeToken = sub.unsubscribeToken;
        if (!unsubscribeToken) {
          unsubscribeToken = generateToken();
          await prisma.newsletterSubscriber.update({
            where: { id: sub.id },
            data: { unsubscribeToken },
          });
          tokenRepaired++;
        }

        if (!categoryPreferencesMatch(sub.preferences, article.categoryId, article.category?.parentId)) {
          preferencesSkipped++;
          continue;
        }

        recipients.push({ ...sub, unsubscribeToken });
      }

      logger.info("ArticleNewsletter", "[Notification] Recipients selected", {
        articleId,
        title: article.title,
        activeVerified: subscribers.length,
        alreadySentSkipped,
        tokenRepaired,
        excludedByPreferences: preferencesSkipped,
        recipients: recipients.length,
      });

      if (recipients.length === 0) {
        logger.info("ArticleNewsletter", "[Notification] No recipients to notify", { articleId });
        await prisma.article.update({
          where: { id: articleId },
          data: { newsletterSentAt: new Date() },
        });
        if (delivery) {
          await prisma.articleNewsletterDelivery.update({
            where: { id: delivery.id },
            data: { status: "SENT", sentAt: new Date(), lastAttemptAt: new Date() },
          });
        }
        return;
      }

      if (!delivery) {
        delivery = await prisma.articleNewsletterDelivery.create({
          data: { articleId, status: "SENDING", totalRecipients: recipients.length },
        });
      } else {
        await prisma.articleNewsletterDelivery.update({
          where: { id: delivery.id },
          data: { status: "SENDING", totalRecipients: recipients.length, lastAttemptAt: new Date() },
        });
      }

      const deliveryId = delivery.id;

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

      for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
          batch.map(async (subscriber) => {
            try {
              await emailService.sendArticleEmail(
                subscriber.email,
                articleEmail,
                subscriber.unsubscribeToken
              );

              await prisma.articleNewsletterRecipient.upsert({
                where: {
                  deliveryId_subscriberId: { deliveryId, subscriberId: subscriber.id },
                },
                create: {
                  deliveryId,
                  subscriberId: subscriber.id,
                  email: subscriber.email,
                  name: subscriber.name,
                  status: "SENT",
                  sentAt: new Date(),
                },
                update: {
                  status: "SENT",
                  sentAt: new Date(),
                  failedAt: null,
                  errorMessage: null,
                },
              });

              await prisma.newsletterSubscriber.update({
                where: { id: subscriber.id },
                data: { lastEmailSentAt: new Date() },
              });

              logger.info("ArticleNewsletter", "[Notification] Email sent to subscriber", {
                articleId,
                email: subscriber.email,
                deliveryId,
              });
            } catch (err) {
              await prisma.articleNewsletterRecipient.upsert({
                where: {
                  deliveryId_subscriberId: { deliveryId, subscriberId: subscriber.id },
                },
                create: {
                  deliveryId,
                  subscriberId: subscriber.id,
                  email: subscriber.email,
                  name: subscriber.name,
                  status: "FAILED",
                  failedAt: new Date(),
                  errorMessage: String(err),
                },
                update: {
                  status: "FAILED",
                  failedAt: new Date(),
                  sentAt: null,
                  errorMessage: String(err),
                },
              });

              logger.error("ArticleNewsletter", "[Notification] Failed to send article email", {
                articleId,
                email: subscriber.email,
                error: String(err),
              });
            }
          })
        );

        const batchSent = results.filter((r) => r.status === "fulfilled").length;
        sent += batchSent;
        failed += results.length - batchSent;

        logger.info("ArticleNewsletter", "[Notification] Batch processed", {
          articleId,
          batchDone: Math.min(i + batch.length, recipients.length),
          total: recipients.length,
          batchSent,
        });
      }

      const finalStatus = failed === 0 ? "SENT" : sent > 0 ? "PARTIAL" : "FAILED";

      await prisma.articleNewsletterDelivery.update({
        where: { id: deliveryId },
        data: {
          status: finalStatus,
          totalSent: sent,
          totalFailed: failed,
          sentAt: failed === 0 ? new Date() : undefined,
          lastAttemptAt: new Date(),
        },
      });

      if (finalStatus !== "FAILED") {
        await prisma.article.update({
          where: { id: articleId },
          data: { newsletterSentAt: new Date() },
        });
      }

      logger.info("ArticleNewsletter", "[Notification] Newsletter delivery complete", {
        articleId,
        title: article.title,
        total: recipients.length,
        sent,
        failed,
        status: finalStatus,
      });
    } catch (err) {
      logger.error("ArticleNewsletter", "[Notification] Failed to trigger newsletter", {
        articleId,
        error: String(err),
      });
    }
  },
};
