import { articleRepository, ArticleQueryParams, CreateArticleInput, UpdateArticleInput } from "../repositories/articleRepository";
import { AppError } from "../middlewares/errorHandler";
import { AuthenticatedUser } from "../types/express";
import { formatArticle, formatArticleList } from "../utils/formatArticle";
import prisma from "../utils/prisma";
import { articleNewsletterService } from "./articleNewsletterService";
import { eventService } from "./eventService";
import { cleanupOrphanedMedia } from "../utils/mediaCleanup";

export const articleService = {
  async getAll(params: ArticleQueryParams) {
    const result = await articleRepository.findAllPublished(params);
    return {
      ...result,
      articles: formatArticleList(result.articles),
    };
  },

  async getAllAdmin(params: ArticleQueryParams & { status?: string }, user: AuthenticatedUser) {
    let result;
    if (user.role.name === "Journalist" || user.role.name === "Editor") {
      result = await articleRepository.findAllByAuthor(user.id, params);
    } else {
      result = await articleRepository.findAllAdmin(params);
    }
    return {
      ...result,
      articles: formatArticleList(result.articles),
    };
  },

  async getBySlug(slug: string) {
    const article = await articleRepository.findPublishedBySlug(slug);
    if (!article) {
      throw new AppError("Article not found", 404);
    }
    return formatArticle(article);
  },

  async getById(id: string, user?: AuthenticatedUser) {
    const article = await articleRepository.findByIdWithDetails(id);
    if (!article) {
      throw new AppError("Article not found", 404);
    }

    if (user && user.role.name !== "Admin" && article.authorId !== user.id) {
      throw new AppError("You can only view your own articles", 403);
    }

    return formatArticle(article);
  },

  async getFeatured() {
    const articles = await articleRepository.findFeatured();
    return formatArticleList(articles);
  },

  async getLatest() {
    const articles = await articleRepository.findLatest();
    return formatArticleList(articles);
  },

  async create(data: CreateArticleInput, user: AuthenticatedUser) {
    const { authorUserId, ...rest } = data;
    const createData = { ...rest, authorId: authorUserId || user.id } as CreateArticleInput;

    if (createData.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: createData.categoryId } });
      if (!cat) throw new AppError("Category not found", 400);
    }

    if (user.role.name !== "Admin" && user.role.name !== "Editor") {
      createData.status = "DRAFT";
    }

    const article = await articleRepository.create(createData);
    return formatArticle(article);
  },

  async submitForReview(id: string, user: AuthenticatedUser) {
    const existing = await articleRepository.findById(id);
    if (!existing) {
      throw new AppError("Article not found", 404);
    }

    if (user.role.name === "Journalist" && existing.authorId !== user.id) {
      throw new AppError("You can only submit your own articles for review", 403);
    }

    if (existing.status !== "DRAFT") {
      throw new AppError("Only draft articles can be submitted for review", 400);
    }

    const article = await articleRepository.update(id, { status: "PENDING_REVIEW" });
    return formatArticle(article);
  },

  async update(id: string, data: UpdateArticleInput, user: AuthenticatedUser) {
    const existing = await articleRepository.findById(id);
    if (!existing) {
      throw new AppError("Article not found", 404);
    }

    if (user.role.name === "Journalist" || user.role.name === "Editor") {
      if (existing.authorId !== user.id) {
        throw new AppError("You can only update your own articles", 403);
      }
    }

    if (user.role.name === "Journalist") {
      if (existing.status !== "DRAFT") {
        throw new AppError("You can only edit articles in Draft status", 403);
      }
      if (data.status && data.status !== "DRAFT" && data.status !== "PENDING_REVIEW") {
        throw new AppError("You can only save as Draft or Submit for Review", 403);
      }
    }

    if (data.status === "PUBLISHED" && user.role.name !== "Admin" && user.role.name !== "Editor") {
      throw new AppError("Only editors and admins can publish articles", 403);
    }

    if (data.status === "ARCHIVED" && user.role.name !== "Admin" && user.role.name !== "Editor") {
      throw new AppError("Only editors and admins can archive articles", 403);
    }

    if (data.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!cat) throw new AppError("Category not found", 400);
    }

    const { authorUserId: auId, ...restData } = data;
    const updateData = { ...restData } as UpdateArticleInput;
    if (auId) {
      updateData.authorId = auId;
    }

    const wasPublished = existing.status === "PUBLISHED";
    const article = await articleRepository.update(id, updateData);

    if (!wasPublished && article.status === "PUBLISHED") {
      articleNewsletterService.sendArticleNewsletter(id).catch((err) => {
        console.error(`[articleNewsletter] Failed to send for article ${id}:`, err);
      });
      const catSlug = existing.categoryId
        ? (await prisma.category.findUnique({ where: { id: existing.categoryId }, select: { slug: true } }))?.slug
        : undefined;

      eventService.emitArticleEvent("article:published", {
        articleId: id,
        slug: article.slug,
        title: article.title,
        categorySlug: catSlug,
        isFeatured: article.isFeatured,
        publishedAt: article.publishedAt?.toISOString(),
      });
    }

    return formatArticle(article);
  },

  async delete(id: string, user: AuthenticatedUser) {
    const existing = await articleRepository.findById(id);
    if (!existing) {
      throw new AppError("Article not found", 404);
    }

    if (user.role.name === "Journalist") {
      if (existing.authorId !== user.id) {
        throw new AppError("You can only delete your own articles", 403);
      }
      if (existing.status !== "DRAFT") {
        throw new AppError("You can only delete articles in Draft status", 403);
      }
    }

    const featuredImageId = existing.featuredImageId;

    await articleRepository.delete(id);

    if (featuredImageId) {
      try {
        await cleanupOrphanedMedia(featuredImageId);
      } catch (err) {
        console.error("Failed to clean up orphaned media:", err);
      }
    }
  },
};
