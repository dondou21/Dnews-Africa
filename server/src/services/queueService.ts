import { campaignRepository } from "../repositories/campaignRepository";
import { emailService } from "./emailService";
import { logger } from "../utils/logger";

const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 2000;

export const queueService = {
  async processCampaignQueue(campaignId: string) {
    logger.info("QueueService", "Processing campaign queue", { campaignId });
    await this.processBatch(campaignId);
  },

  async processBatch(campaignId: string) {
    const pending = await campaignRepository.findPendingRecipients(campaignId, BATCH_SIZE);

    if (pending.length === 0) {
      const [pCount, sentCount, failedCount] = await campaignRepository.countRecipientsByStatus(campaignId);
      await campaignRepository.update(campaignId, {
        status: failedCount > 0 && sentCount === 0 ? "DRAFT" : "SENT",
        sentAt: new Date(),
        totalSent: sentCount,
        totalFailed: failedCount,
      });
      logger.info("QueueService", "Campaign queue complete", { campaignId, sentCount, failedCount });
      return;
    }

    const campaign = await campaignRepository.findById(campaignId);
    if (!campaign) return;

    const promises = pending.map(async (recipient) => {
      try {
        await emailService.sendCampaignEmail(
          recipient.subscriber.email,
          recipient.subscriber.name || undefined,
          campaign.subject,
          campaign.content
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

    if (pendingCount > 0) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      await this.processBatch(campaignId);
    } else {
      const [, sentCount, failedCount] = await campaignRepository.countRecipientsByStatus(campaignId);
      await campaignRepository.update(campaignId, {
        status: "SENT",
        sentAt: new Date(),
        totalSent: sentCount,
        totalFailed: failedCount,
      });
      logger.info("QueueService", "Campaign queue finished", { campaignId });
    }
  },

  async retryFailed(recipientId: string) {
    const recipient = await campaignRepository.findPendingRecipients(recipientId, 1);
    if (recipient.length === 0) {
      logger.warn("QueueService", "No failed recipient found for retry", { recipientId });
      return;
    }

    const r = recipient[0];
    try {
      await emailService.sendCampaignEmail(
        r.subscriber.email,
        r.subscriber.name || undefined,
        "Retry",
        ""
      );
      await campaignRepository.updateRecipient(r.id, {
        status: "SENT",
        sentAt: new Date(),
        failedAt: null,
        errorMessage: null,
      });
      logger.info("QueueService", "Retry successful", { recipientId: r.id });
    } catch (err) {
      await campaignRepository.updateRecipient(r.id, {
        failedAt: new Date(),
        errorMessage: String(err),
      });
      logger.error("QueueService", "Retry failed", { recipientId: r.id, error: String(err) });
    }
  },
};
