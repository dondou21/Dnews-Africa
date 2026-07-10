import prisma from "../utils/prisma";
import { automationRepository } from "../repositories/automationRepository";
import { campaignService } from "./campaignService";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../utils/logger";

function computeNextRun(frequency: string, sendDay: number | null | undefined, sendTime: string, timezone: string): Date {
  const now = new Date();
  const [hours, minutes] = sendTime.split(":").map(Number);
  const next = new Date(now);
  next.setHours(hours || 0, minutes || 0, 0, 0);

  if (frequency === "DAILY") {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (frequency === "WEEKLY") {
    const targetDay = sendDay ?? 1;
    const currentDay = now.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0 || (daysUntil === 0 && next <= now)) daysUntil += 7;
    next.setDate(next.getDate() + daysUntil);
  } else if (frequency === "MONTHLY") {
    const targetDay = Math.min(sendDay ?? 1, 28);
    next.setDate(targetDay);
    if (next <= now) next.setMonth(next.getMonth() + 1);
  }

  return next;
}

export const automationService = {
  async getAll() {
    return automationRepository.findAll();
  },

  async getById(id: string) {
    const automation = await automationRepository.findById(id);
    if (!automation) throw new AppError("Automation not found", 404);
    return automation;
  },

  async create(data: {
    name: string;
    frequency: string;
    sendDay?: number;
    sendTime: string;
    timezone?: string;
    templateId: string;
    enabled?: boolean;
  }) {
    const nextRun = computeNextRun(data.frequency, data.sendDay ?? null, data.sendTime, data.timezone || "UTC");

    const automation = await automationRepository.create({
      name: data.name,
      frequency: data.frequency as any,
      sendDay: data.sendDay ?? null,
      sendTime: data.sendTime,
      timezone: data.timezone || "UTC",
      enabled: data.enabled ?? true,
      template: { connect: { id: data.templateId } },
      nextRun,
    });

    logger.info("AutomationService", "Automation created", { id: automation.id });
    return automation;
  },

  async update(id: string, data: {
    name?: string;
    frequency?: string;
    sendDay?: number;
    sendTime?: string;
    timezone?: string;
    templateId?: string;
    enabled?: boolean;
  }) {
    const existing = await automationRepository.findById(id);
    if (!existing) throw new AppError("Automation not found", 404);

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.sendDay !== undefined) updateData.sendDay = data.sendDay;
    if (data.sendTime !== undefined) updateData.sendTime = data.sendTime;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;
    if (data.templateId !== undefined) {
      updateData.template = { connect: { id: data.templateId } };
    }

    if (data.frequency || data.sendDay || data.sendTime || data.timezone) {
      const freq = String(data.frequency || existing.frequency);
      const day = data.sendDay ?? existing.sendDay ?? undefined;
      const time = data.sendTime || existing.sendTime;
      const tz = data.timezone || existing.timezone;
      updateData.nextRun = computeNextRun(freq, day as number, time, tz);
    }

    const automation = await automationRepository.update(id, updateData);
    logger.info("AutomationService", "Automation updated", { id });
    return automation;
  },

  async delete(id: string) {
    const existing = await automationRepository.findById(id);
    if (!existing) throw new AppError("Automation not found", 404);
    await automationRepository.delete(id);
    logger.info("AutomationService", "Automation deleted", { id });
  },

  async generateDigestContent(frequency: string) {
    const isMonthly = frequency === "MONTHLY";

    const [recentArticles, featuredArticles] = await Promise.all([
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: { id: true, title: true, summary: true, slug: true },
      }),
      prisma.article.findMany({
        where: { status: "PUBLISHED", isFeatured: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: { id: true, title: true, summary: true, slug: true },
      }),
    ]);

    const topArticles = [...featuredArticles, ...recentArticles].slice(0, 5);

    let html = `<h2>${isMonthly ? "Monthly" : "Weekly"} Digest</h2>`;

    if (featuredArticles.length > 0) {
      html += '<h3>Editor\'s Picks</h3>';
      featuredArticles.forEach((a) => {
        html += `<div style="margin-bottom:16px;">
          <h4><a href="${process.env.CLIENT_URL || "http://localhost:3000"}/article/${a.slug}" style="color:#c0392b;text-decoration:none;">${a.title}</a></h4>
          <p style="color:#666;font-size:13px;">${a.summary}</p>
        </div>`;
      });
    }

    html += '<h3>Top Stories</h3>';
    topArticles.forEach((a) => {
      html += `<div style="margin-bottom:12px;">
        <h4 style="margin:0 0 4px;"><a href="${process.env.CLIENT_URL || "http://localhost:3000"}/article/${a.slug}" style="color:#1a1a2e;text-decoration:none;">${a.title}</a></h4>
        <p style="color:#999;font-size:12px;margin:0;">${a.summary}</p>
      </div>`;
    });

    if (recentArticles.length > 0) {
      html += '<h3>Recent Articles</h3>';
      recentArticles.forEach((a) => {
        html += `<div style="margin-bottom:12px;">
          <h4 style="margin:0 0 4px;font-size:14px;"><a href="${process.env.CLIENT_URL || "http://localhost:3000"}/article/${a.slug}" style="color:#1a1a2e;text-decoration:none;">${a.title}</a></h4>
        </div>`;
      });
    }

    return html;
  },

  async runAutomation(id: string) {
    const automation = await automationRepository.findById(id);
    if (!automation || !automation.enabled) {
      throw new AppError("Automation not found or disabled", 400);
    }

    const content = await this.generateDigestContent(automation.frequency);
    const subject = automation.template?.subject
      ? automation.template.subject.replace("{frequency}", automation.frequency.toLowerCase())
      : `${automation.frequency.charAt(0) + automation.frequency.slice(1).toLowerCase()} Digest`;

    const campaign = await campaignService.create(
      {
        title: `${automation.frequency.charAt(0) + automation.frequency.slice(1).toLowerCase()} Digest - ${new Date().toLocaleDateString()}`,
        subject,
        content,
        status: "DRAFT",
      },
      { id: "system", role: { name: "Admin" } } as any
    );

    const nextRun = computeNextRun(automation.frequency, automation.sendDay ?? null, automation.sendTime, automation.timezone);
    await automationRepository.update(id, {
      lastRun: new Date(),
      nextRun,
    });

    logger.info("AutomationService", "Digest campaign created", { automationId: id, campaignId: campaign.id });
    return campaign;
  },
};
