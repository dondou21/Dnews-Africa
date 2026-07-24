import { $Enums } from "@prisma/client";
import { campaignRepository } from "../repositories/campaignRepository";
import { newsletterRepository } from "../repositories/newsletterRepository";
import { emailService } from "./emailService";
import { AppError } from "../middlewares/errorHandler";
import { logger } from "../utils/logger";
import type { AuthenticatedUser } from "../types/express";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const BATCH_SIZE = 100;

export const campaignService = {
  async getAll(params: {
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    search?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));

    const [campaigns, total] = await campaignRepository.findAll({
      page,
      limit,
      sort: params.sort,
      status: params.status,
      search: params.search,
    });

    return {
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }
    return campaign;
  },

  async create(data: {
    title: string;
    subject: string;
    content: string;
    plainText?: string;
    excerpt?: string;
    featuredImage?: string;
    status?: string;
  }, user: AuthenticatedUser) {
    let slug = generateSlug(data.title);
    const existing = await campaignRepository.findBySlug(slug);
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const campaign = await campaignRepository.create({
      title: data.title,
      subject: data.subject,
      slug,
      content: data.content,
      plainText: data.plainText || null,
      excerpt: data.excerpt || null,
      featuredImage: data.featuredImage || null,
      status: (data.status as $Enums.CampaignStatus) || "DRAFT",
      createdBy: { connect: { id: user.id } },
    });

    logger.info("CampaignService", "Campaign created", { id: campaign.id, title: data.title });

    return campaign;
  },

  async update(id: string, data: {
    title?: string;
    subject?: string;
    content?: string;
    plainText?: string;
    excerpt?: string;
    featuredImage?: string;
    status?: string;
  }, user: AuthenticatedUser) {
    const existing = await campaignRepository.findById(id);
    if (!existing) {
      throw new AppError("Campaign not found", 404);
    }

    if (existing.status === "SENT" || existing.status === "SENDING") {
      throw new AppError("Cannot update a campaign that has been sent or is sending", 400);
    }

    const updateData: Record<string, unknown> = {
      updatedBy: { connect: { id: user.id } },
    };

    if (data.title !== undefined) {
      updateData.title = data.title;
      let slug = generateSlug(data.title);
      const slugExists = await campaignRepository.findBySlug(slug);
      if (slugExists && slugExists.id !== id) {
        slug = `${slug}-${Date.now()}`;
      }
      updateData.slug = slug;
    }
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.plainText !== undefined) updateData.plainText = data.plainText;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage;
    if (data.status !== undefined) updateData.status = data.status;

    const campaign = await campaignRepository.update(id, updateData);

    logger.info("CampaignService", "Campaign updated", { id });

    return campaign;
  },

  async delete(id: string) {
    const existing = await campaignRepository.findById(id);
    if (!existing) {
      throw new AppError("Campaign not found", 404);
    }

    if (existing.status === "SENDING") {
      throw new AppError("Cannot cancel a campaign that is currently sending", 400);
    }

    await campaignRepository.delete(id);

    logger.info("CampaignService", "Campaign cancelled", { id });
  },

  async send(id: string, user: AuthenticatedUser) {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    if (campaign.status === "SENT") {
      throw new AppError("Campaign has already been sent", 400);
    }

    if (campaign.status === "SENDING") {
      throw new AppError("Campaign is currently sending", 400);
    }

    if (!campaign.content) {
      throw new AppError("Cannot send an empty campaign", 400);
    }

    const recipients = await campaignRepository.findActiveRecipients();
    if (recipients.length === 0) {
      throw new AppError("No active subscribers to send to", 400);
    }

    await campaignRepository.update(id, {
      status: "SENDING",
      updatedBy: { connect: { id: user.id } },
      totalRecipients: recipients.length,
    });

    await campaignRepository.createRecipients(
      recipients.map((r) => ({ campaignId: id, subscriberId: r.id }))
    );

    logger.info("CampaignService", "Campaign sending started", { id, recipientCount: recipients.length });

    await this.processBatch(id);

    return this.getById(id);
  },

  async processBatch(campaignId: string) {
    const pending = await campaignRepository.findPendingRecipients(campaignId, BATCH_SIZE);

    if (pending.length === 0) {
      const [pendingCount, sentCount, failedCount] = await campaignRepository.countRecipientsByStatus(campaignId);
      const totalFailed = failedCount;
      const totalSent = sentCount;

      await campaignRepository.update(campaignId, {
        status: totalFailed > 0 && totalSent === 0 ? "DRAFT" : "SENT",
        sentAt: new Date(),
        totalSent,
        totalFailed,
      });

      logger.info("CampaignService", "Campaign sending complete", { campaignId, totalSent, totalFailed });
      return;
    }

    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) return;

    const buildContent = (subscriber: { email: string; name: string | null }) => {
      const unsubscribeUrl = `${process.env.CLIENT_URL || "http://localhost:5000"}/api/newsletter/unsubscribe`;
      const name = subscriber.name || "there";

      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:4px;overflow:hidden;">
          <tr>
            <td style="padding:30px 40px;text-align:center;background-color:#1a1a2e;">
              <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700;">Dnews Africa</h1>
            </td>
          </tr>
          ${campaign.featuredImage ? `
          <tr>
            <td style="padding:0;">
              <img src="${campaign.featuredImage}" alt="" style="display:block;width:100%;max-width:600px;height:auto;" />
            </td>
          </tr>` : ""}
          <tr>
            <td style="padding:40px 40px 20px;">
              <p style="color:#666666;font-size:14px;margin:0 0 8px;">Hi ${name},</p>
              ${campaign.excerpt ? `<p style="color:#999;font-size:13px;margin:0 0 20px;font-style:italic;">${campaign.excerpt}</p>` : ""}
              <div style="color:#333333;font-size:15px;line-height:1.7;">
                ${campaign.content}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="background-color:#c0392b;border-radius:4px;padding:0;">
                    <a href="https://dnewsafrica.com" target="_blank" style="display:inline-block;padding:12px 32px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
                      Read More on Dnews Africa
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="color:#aaaaaa;font-size:12px;margin:0 0 12px;">
                Follow us for the latest African stories.
              </p>
              <p style="color:#aaaaaa;font-size:11px;margin:0 0 8px;">
                <a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline;">Unsubscribe</a>
              </p>
              <p style="color:#aaaaaa;font-size:11px;margin:0;">
                &copy; ${new Date().getFullYear()} Dnews Africa. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    };

    const promises = pending.map(async (recipient) => {
      try {
        await emailService.sendCampaignEmail(
          recipient.subscriber.email,
          recipient.subscriber.name || undefined,
          campaign.subject,
          buildContent(recipient.subscriber)
        );
        await campaignRepository.updateRecipient(recipient.id, {
          status: "SENT",
          sentAt: new Date(),
        });
      } catch (err) {
        await campaignRepository.updateRecipient(recipient.id, {
          status: "FAILED",
          failedAt: new Date(),
          errorMessage: String(err),
        });
      }
    });

    await Promise.allSettled(promises);

    const [pendingCount] = await campaignRepository.countRecipientsByStatus(campaignId);

    await campaignRepository.update(campaignId, {
      totalSent: { increment: pending.filter((r) => true).length },
    });

    if (pendingCount > 0) {
      await this.processBatch(campaignId);
    } else {
      const [, sentCount, failedCount] = await campaignRepository.countRecipientsByStatus(campaignId);
      await campaignRepository.update(campaignId, {
        status: "SENT",
        sentAt: new Date(),
        totalSent: sentCount,
        totalFailed: failedCount,
      });
      logger.info("CampaignService", "Campaign sent successfully", { campaignId });
    }
  },

  async schedule(id: string, scheduledAt: string, user: AuthenticatedUser) {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    const scheduleDate = new Date(scheduledAt);
    if (isNaN(scheduleDate.getTime())) {
      throw new AppError("Invalid scheduled date", 400);
    }

    if (scheduleDate <= new Date()) {
      throw new AppError("Scheduled time must be in the future", 400);
    }

    if (campaign.status === "SENT") {
      throw new AppError("Campaign has already been sent", 400);
    }

    if (!campaign.content) {
      throw new AppError("Cannot schedule an empty campaign", 400);
    }

    const updated = await campaignRepository.update(id, {
      status: "SCHEDULED",
      scheduledAt: scheduleDate,
      updatedBy: { connect: { id: user.id } },
    });

    logger.info("CampaignService", "Campaign scheduled", { id, scheduledAt });

    return updated;
  },

  async cancel(id: string, user: AuthenticatedUser) {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError("Campaign not found", 404);
    }

    if (campaign.status === "SENT") {
      throw new AppError("Cannot cancel a sent campaign", 400);
    }

    if (campaign.status === "SENDING") {
      throw new AppError("Cannot cancel a campaign that is currently sending", 400);
    }

    if (campaign.status !== "SCHEDULED" && campaign.status !== "DRAFT") {
      throw new AppError("Campaign cannot be cancelled in its current state", 400);
    }

    const updated = await campaignRepository.update(id, {
      status: "CANCELLED",
      updatedBy: { connect: { id: user.id } },
    });

    logger.info("CampaignService", "Campaign cancelled", { id });

    return updated;
  },

  async getStats() {
    const [total, drafts, scheduled, sending, sent] = await campaignRepository.countByStatus();
    return { total, drafts, scheduled, sending, sent };
  },
};
