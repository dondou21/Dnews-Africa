import { config } from "../config";
import { logger } from "../utils/logger";
import { buildWelcomeEmail, buildUnsubscribeConfirmationEmail, buildResubscribeConfirmationEmail } from "./emailTemplates";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function sendEmailWithRetry(params: SendEmailParams, attempt: number = 1): Promise<void> {
  if (!config.isProduction || !config.resendApiKey) {
    logger.info("EmailService", "Email skipped (dev mode or no API key)", { to: params.to, subject: params.subject });
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(config.resendApiKey);
    const result = await resend.emails.send({
      from: config.emailFrom || "noreply@dnewsafrica.com",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    logger.info("EmailService", "Email sent", { to: params.to, subject: params.subject, id: (result as any)?.id });
  } catch (err) {
    const errorStr = String(err);
    logger.error("EmailService", `Email send failed (attempt ${attempt}/${MAX_RETRIES})`, { to: params.to, subject: params.subject, error: errorStr });

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      return sendEmailWithRetry(params, attempt + 1);
    }

    logger.error("EmailService", "Email send failed after all retries", { to: params.to, subject: params.subject, error: errorStr });
    throw err;
  }
}

export const emailService = {
  async sendCampaignEmail(email: string, _name: string | undefined, subject: string, html: string): Promise<void> {
    await sendEmailWithRetry({ to: email, subject, html });
  },

  async sendWelcomeEmail(email: string, name?: string, unsubscribeToken?: string): Promise<void> {
    const unsubscribeUrl = unsubscribeToken
      ? `${config.clientUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`
      : undefined;
    await sendEmailWithRetry({
      to: email,
      subject: "Welcome to Dnews Africa!",
      html: buildWelcomeEmail(name, unsubscribeUrl),
    });
  },

  async sendUnsubscribeConfirmationEmail(email: string, resubscribeUrl: string): Promise<void> {
    await sendEmailWithRetry({
      to: email,
      subject: "You've been unsubscribed from Dnews Africa",
      html: buildUnsubscribeConfirmationEmail(resubscribeUrl),
    });
  },

  async sendResubscribeConfirmationEmail(email: string): Promise<void> {
    await sendEmailWithRetry({
      to: email,
      subject: "Welcome back to Dnews Africa!",
      html: buildResubscribeConfirmationEmail(),
    });
  },
};
