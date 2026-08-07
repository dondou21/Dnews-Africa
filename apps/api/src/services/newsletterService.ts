import { $Enums } from "@prisma/client";
import crypto from "crypto";
import { newsletterRepository } from "../repositories/newsletterRepository";
import { emailService } from "./emailService";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../utils/logger";
import { config } from "../config";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const newsletterService = {
  async subscribe(data: {
    email: string;
    name?: string;
    firstName?: string;
    source?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    preferredLanguage?: string;
    _hp?: string;
  }) {
    if (data._hp) {
      logger.warn("NewsletterService", "Honeypot triggered - bot detected", { email: data.email });
      return { id: "blocked", email: data.email, status: "PENDING" };
    }

    const existing = await newsletterRepository.findByEmail(data.email);

    if (existing) {
      if (existing.status === "ACTIVE" || existing.status === "PENDING") {
        return { id: "duplicate", email: data.email, status: existing.status };
      }

      if (existing.status === "BLOCKED") {
        throw new AppError("This email has been blocked", 403);
      }
    }

    const unsubscribeToken = generateToken();
    const displayName = data.name || data.firstName || null;

    let subscriber;

    if (existing && existing.status === "UNSUBSCRIBED") {
      subscriber = await newsletterRepository.update(existing.id, {
        name: displayName || existing.name,
        status: "ACTIVE",
        verified: true,
        verificationToken: null,
        verificationExpires: null,
        unsubscribeToken,
        source: (data.source as $Enums.NewsletterSource) || existing.source,
        subscribedAt: new Date(),
        confirmedAt: new Date(),
        unsubscribedAt: null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        preferredLanguage: data.preferredLanguage || "en",
      });
    } else {
      subscriber = await newsletterRepository.create({
        email: data.email,
        name: displayName,
        status: "ACTIVE",
        verified: true,
        verificationToken: null,
        verificationExpires: null,
        unsubscribeToken,
        source: data.source as $Enums.NewsletterSource || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        preferredLanguage: data.preferredLanguage || "en",
      });
    }

    logger.info("NewsletterService", "New subscription activated", { email: data.email, status: "ACTIVE" });

    emailService.sendWelcomeEmail(data.email, displayName || undefined, unsubscribeToken)
      .then((result) => {
        logger.info("NewsletterService", "Welcome email sent", {
          email: data.email,
          transport: result.transport,
          emailId: result.emailId,
          capturePath: result.capturePath,
        });
        return newsletterRepository.update(subscriber.id, { lastEmailSentAt: new Date() });
      })
      .catch((err: unknown) =>
        logger.error("NewsletterService", "Failed to send welcome email", { email: data.email, err })
      );

    return { ...subscriber, welcomeEmailSent: true };
  },

  async createSubscriber(data: {
    email: string;
    name?: string;
    source?: string;
    preferredLanguage?: string;
  }) {
    const existing = await newsletterRepository.findByEmail(data.email);

    if (existing) {
      if (existing.status === "ACTIVE" || existing.status === "PENDING") {
        throw new AppError("This email is already subscribed", 409);
      }
      if (existing.status === "BLOCKED") {
        throw new AppError("This email has been blocked", 403);
      }
    }

    const unsubscribeToken = generateToken();

    let subscriber;
    if (existing && existing.status === "UNSUBSCRIBED") {
      subscriber = await newsletterRepository.update(existing.id, {
        name: data.name || existing.name,
        status: "ACTIVE",
        verified: true,
        verificationToken: null,
        verificationExpires: null,
        unsubscribeToken,
        source: (data.source as $Enums.NewsletterSource) || existing.source,
        subscribedAt: new Date(),
        confirmedAt: new Date(),
        unsubscribedAt: null,
        preferredLanguage: data.preferredLanguage || "en",
      });
    } else {
      subscriber = await newsletterRepository.create({
        email: data.email,
        name: data.name || null,
        status: "ACTIVE",
        verified: true,
        verificationToken: null,
        verificationExpires: null,
        unsubscribeToken,
        source: (data.source as $Enums.NewsletterSource) || "MANUAL",
        preferredLanguage: data.preferredLanguage || "en",
      });
    }

    logger.info("NewsletterService", "Subscriber created by admin", { email: data.email, id: subscriber.id });

    emailService.sendWelcomeEmail(subscriber.email, subscriber.name || undefined, unsubscribeToken)
      .then((result) => {
        logger.info("NewsletterService", "Welcome email sent for admin-created subscriber", {
          email: subscriber.email,
          transport: result.transport,
          emailId: result.emailId,
        });
        return newsletterRepository.update(subscriber.id, { lastEmailSentAt: new Date() });
      })
      .catch((err: unknown) =>
        logger.error("NewsletterService", "Failed to send welcome email for admin-created subscriber", {
          email: subscriber.email,
          err,
        })
      );

    return subscriber;
  },

  async sendTestNewsletter() {
    logger.info("NewsletterService", "[Email] Loading subscribers...");
    const subscribers = await newsletterRepository.findAllActive({
      id: true,
      email: true,
      name: true,
      unsubscribeToken: true,
    });
    logger.info("NewsletterService", `[Email] ${subscribers.length} subscribers found`);

    const results: { email: string; status: "sent" | "failed"; error?: string }[] = [];
    let sent = 0;
    let failed = 0;

    for (const sub of subscribers) {
      let unsubscribeToken = sub.unsubscribeToken;
      if (!unsubscribeToken) {
        unsubscribeToken = generateToken();
        await newsletterRepository.update(sub.id, { unsubscribeToken });
      }

      logger.info("NewsletterService", `[Email] Sending test newsletter to ${sub.email}`);
      try {
        const result = await emailService.sendTestNewsletterEmail(
          sub.email,
          sub.name || undefined,
          unsubscribeToken
        );
        sent++;
        results.push({ email: sub.email, status: "sent" });
        logger.info("NewsletterService", "[Email] Success", {
          email: sub.email,
          transport: result.transport,
          emailId: result.emailId,
        });
        await newsletterRepository.update(sub.id, { lastEmailSentAt: new Date() });
      } catch (err) {
        failed++;
        results.push({
          email: sub.email,
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
        });
        logger.error("NewsletterService", `[Email] Failed: ${sub.email}`, { err, email: sub.email });
      }
    }

    const summary = { totalRecipients: subscribers.length, sent, failed, results };
    logger.info("NewsletterService", "[Email] Test newsletter complete", {
      totalRecipients: summary.totalRecipients,
      sent,
      failed,
    });

    return summary;
  },

  async verify(_token: string) {
    throw new AppError("Email verification is no longer required. Your subscription is activated immediately.", 400);
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

    try {
      const resubscribeUrl = `${config.clientUrl}/newsletter/resubscribe?token=${subscriber.unsubscribeToken}`;
      await emailService.sendUnsubscribeConfirmationEmail(email, resubscribeUrl);
    } catch (err) {
      logger.error("NewsletterService", "Failed to send unsubscribe confirmation email", { email, err });
    }

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

  async unsubscribeByToken(token: string) {
    const subscriber = await newsletterRepository.findByUnsubscribeToken(token);

    if (!subscriber) {
      throw new AppError("Invalid unsubscribe token", 400);
    }

    if (subscriber.status === "UNSUBSCRIBED") {
      throw new AppError("Email is already unsubscribed", 400);
    }

    const updated = await newsletterRepository.update(subscriber.id, {
      status: "UNSUBSCRIBED",
      unsubscribedAt: new Date(),
    });

    logger.info("NewsletterService", "Unsubscribed by token", { email: subscriber.email });

    try {
      const resubscribeUrl = `${config.clientUrl}/newsletter/resubscribe?token=${subscriber.unsubscribeToken}`;
      await emailService.sendUnsubscribeConfirmationEmail(subscriber.email, resubscribeUrl);
    } catch (err) {
      logger.error("NewsletterService", "Failed to send unsubscribe confirmation email", {
        email: subscriber.email,
        err,
      });
    }

    return updated;
  },

  async resubscribe(token: string) {
    const subscriber = await newsletterRepository.findByUnsubscribeToken(token);

    if (!subscriber) {
      throw new AppError("Invalid token", 400);
    }

    if (subscriber.status !== "UNSUBSCRIBED") {
      throw new AppError("Email is already active", 400);
    }

    const unsubscribeToken = generateToken();

    const updated = await newsletterRepository.update(subscriber.id, {
      status: "ACTIVE",
      verified: true,
      verificationToken: null,
      verificationExpires: null,
      unsubscribeToken,
      unsubscribedAt: null,
    });

    logger.info("NewsletterService", "Resubscribe activated", { email: subscriber.email });

    emailService.sendWelcomeEmail(subscriber.email, subscriber.name || undefined, unsubscribeToken)
      .then((result) => {
        logger.info("NewsletterService", "Welcome email sent on resubscribe", {
          email: subscriber.email,
          transport: result.transport,
          emailId: result.emailId,
        });
        return newsletterRepository.update(subscriber.id, { lastEmailSentAt: new Date() });
      })
      .catch((err: unknown) =>
        logger.error("NewsletterService", "Failed to send welcome email on resubscribe", {
          email: subscriber.email,
          err,
        })
      );

    return updated;
  },

  async resendConfirmation(_id: string) {
    throw new AppError("Email confirmation is no longer required. All subscriptions are activated immediately.", 400);
  },

  async getByUnsubscribeToken(token: string) {
    const subscriber = await newsletterRepository.findByUnsubscribeToken(token);
    if (!subscriber) {
      throw new AppError("Invalid token", 400);
    }
    return {
      id: subscriber.id,
      email: subscriber.email,
      name: subscriber.name,
      status: subscriber.status,
      preferences: subscriber.preferences,
    };
  },

  async updatePreferences(token: string, preferences: Record<string, boolean>) {
    const subscriber = await newsletterRepository.findByUnsubscribeToken(token);
    if (!subscriber) {
      throw new AppError("Invalid token", 400);
    }
    await newsletterRepository.update(subscriber.id, { preferences: preferences as object });
    logger.info("NewsletterService", "Preferences updated", { email: subscriber.email });
  },

  async getStats() {
    const [total, active, pending, blocked, unsubscribed] = await newsletterRepository.countByStatus();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyTotal, weeklyActive] = await newsletterRepository.countByDateRange(weekAgo);
    const [monthlyTotal, monthlyActive] = await newsletterRepository.countByDateRange(monthAgo);

    return {
      total,
      active,
      pending,
      blocked,
      unsubscribed,
      growthThisWeek: weeklyActive,
      growthThisMonth: monthlyActive,
    };
  },
};
