import prisma from "../utils/prisma";
import { logger } from "../utils/logger";
import { articleRepository } from "../repositories/articleRepository";

export const articleNewsletterService = {
  async sendArticleNewsletter(articleId: string): Promise<void> {
    try {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          sendNewsletter: true,
          newsletterSentAt: true,
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

      await prisma.article.update({
        where: { id: articleId },
        data: { newsletterSentAt: new Date() },
      });

      logger.info("ArticleNewsletter", "Newsletter triggered for article", { articleId, title: article.title });
    } catch (err) {
      logger.error("ArticleNewsletter", "Failed to trigger newsletter", { articleId, error: String(err) });
    }
  },
};
