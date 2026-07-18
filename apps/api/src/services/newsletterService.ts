import { $Enums } from "@prisma/client";
import crypto from "crypto";
import { newsletterRepository } from "../repositories/newsletterRepository";
import { emailService } from "./emailService";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../utils/logger";

const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export const newsletterService = {
  async subscribe(data: { email: string; name?: string; source?: string }) {
    const existing = await newsletterRepository.findByEmail(data.email);

    if (existing) {
      if (existing.status === "ACTIVE" || existing.status === "PENDING") {
        throw new AppError("Email is already subscribed", 409);
      }

      if (existing.status === "BLOCKED") {
        throw new AppError("This email has been blocked", 403);
      }
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    let subscriber;

    if (existing && existing.status === "UNSUBSCRIBED") {
      subscriber = await newsletterRepository.update(existing.id, {
        name: data.name || existing.name,
        status: "PENDING",
        verified: false,
        verificationToken,
        verificationExpires,
        source: (data.source as $Enums.NewsletterSource) || existing.source,
        subscribedAt: new Date(),
        unsubscribedAt: null,
      });
    } else {
      subscriber = await newsletterRepository.create({
        email: data.email,
        name: data.name || null,
        status: "PENDING",
        verified: false,
        verificationToken,
        verificationExpires,
        source: data.source as $Enums.NewsletterSource || null,
      });
    }

    logger.info("NewsletterService", "New subscription", { email: data.email });

    try {
      await emailService.sendVerificationEmail(data.email, verificationToken);
    } catch {
      logger.error("NewsletterService", "Failed to send verification email", { email: data.email });
    }

    return subscriber;
  },

  async verify(token: string) {
    const subscriber = await newsletterRepository.findByVerificationToken(token);

    if (!subscriber) {
      throw new AppError("Invalid verification token", 400);
    }

    if (subscriber.verified) {
      throw new AppError("Email is already verified", 400);
    }

    if (subscriber.verificationExpires && new Date() > subscriber.verificationExpires) {
      throw new AppError("Verification token has expired", 400);
    }

    const updated = await newsletterRepository.update(subscriber.id, {
      status: "ACTIVE",
      verified: true,
      verificationToken: null,
      verificationExpires: null,
    });

    logger.info("NewsletterService", "Email verified", { email: subscriber.email });

    return updated;
  },

  async unsubscribeByEmail(email: string) {
    const subscriber = await newsletterRepository.findByEmail(email);

    if (!subscriber) {
      throw new AppError("Email not found", 404);
    }

    if (subscriber.status === "UNSUBSCRIBED") {
      throw new AppError("Email is already unsubscribed", 400);
    }

    const updated = await newsletterRepository.update(subscriber.id, {
      status: "UNSUBSCRIBED",
      unsubscribedAt: new Date(),
    });

    logger.info("NewsletterService", "Email unsubscribed", { email });

    return updated;
  },

  async getAll(params: {
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    source?: string;
    search?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));

    const [subscribers, total] = await newsletterRepository.findAll({
      page,
      limit,
      sort: params.sort,
      status: params.status,
      source: params.source,
      search: params.search,
    });

    return {
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const subscriber = await newsletterRepository.findById(id);
    if (!subscriber) {
      throw new AppError("Subscriber not found", 404);
    }
    return subscriber;
  },

  async update(id: string, data: { status?: string; name?: string }) {
    const subscriber = await newsletterRepository.findById(id);
    if (!subscriber) {
      throw new AppError("Subscriber not found", 404);
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;

    if (data.status) {
      const validStatuses: $Enums.NewsletterStatus[] = ["ACTIVE", "PENDING", "BLOCKED", "UNSUBSCRIBED"];
      if (!validStatuses.includes(data.status as $Enums.NewsletterStatus)) {
        throw new AppError("Invalid status value", 400);
      }
      updateData.status = data.status as $Enums.NewsletterStatus;
      if (data.status === "UNSUBSCRIBED") {
        updateData.unsubscribedAt = new Date();
      }
    }

    const updated = await newsletterRepository.update(id, updateData);

    logger.info("NewsletterService", "Subscriber updated", { id, updates: updateData });

    return updated;
  },

  async delete(id: string) {
    const subscriber = await newsletterRepository.findById(id);
    if (!subscriber) {
      throw new AppError("Subscriber not found", 404);
    }

    const updated = await newsletterRepository.update(id, {
      status: "UNSUBSCRIBED",
      unsubscribedAt: new Date(),
    });

    logger.info("NewsletterService", "Subscriber soft-deleted", { id });

    return updated;
  },

  async getStats() {
    const [total, active, pending, blocked, unsubscribed] = await newsletterRepository.countByStatus();
    return { total, active, pending, blocked, unsubscribed };
  },
};
