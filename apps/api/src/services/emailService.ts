import fs from "fs";
import path from "path";
import { config } from "../config";
import { logger } from "../utils/logger";
import {
  buildWelcomeEmail,
  buildUnsubscribeConfirmationEmail,
  buildResubscribeConfirmationEmail,
  buildArticleEmail,
  buildTestNewsletterEmail,
  type ArticleEmailData,
} from "./emailTemplates";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface EmailSendResult {
  transport: "resend" | "capture";
  emailId?: string;
  capturePath?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function captureEmail(params: SendEmailParams): EmailSendResult {
  const dir = config.emailCaptureDir;
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (err) {
    logger.warn("EmailService", "Failed to create email capture directory", {
      dir,
      error: String(err),
    });
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeTo = params.to.replace(/[^a-zA-Z0-9@._-]/g, "_");
  const capturePath = path.join(dir, `${stamp}-${safeTo}.html`);

  try {
    fs.writeFileSync(
      capturePath,
      `<!--\nTo: ${params.to}\nSubject: ${params.subject}\nTransport: capture (no RESEND_API_KEY or email disabled)\n-->\n${params.html}`
    );
  } catch (err) {
    logger.warn("EmailService", "Failed to write email capture file", {
      error: String(err),
      to: params.to,
      subject: params.subject,
    });
  }

  logger.warn("EmailService", "Email captured (no RESEND_API_KEY or email disabled)", {
    to: params.to,
    subject: params.subject,
    transport: "capture",
    capturePath,
  });

  return { transport: "capture", capturePath };
}

async function sendEmailWithRetry(params: SendEmailParams, attempt: number = 1): Promise<EmailSendResult> {
  if (!config.resendApiKey || !config.emailEnabled) {
    return captureEmail(params);
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

    logger.info("EmailService", "Resend response", {
      to: params.to,
      subject: params.subject,
      response: result,
    });

    if (result.error) {
      throw new Error(
        `Resend API error (${result.error.name}, status ${result.error.statusCode}): ${result.error.message}`
      );
    }

    logger.info("EmailService", "Email sent via Resend", {
      to: params.to,
      subject: params.subject,
      id: result.data.id,
      transport: "resend",
    });

    return { transport: "resend", emailId: result.data.id };
  } catch (err) {
    logger.error("EmailService", `Email send failed (attempt ${attempt}/${MAX_RETRIES})`, {
      to: params.to,
      subject: params.subject,
      err,
    });

    if (attempt < MAX_RETRIES) {
      await delay(RETRY_DELAY_MS * attempt);
      return sendEmailWithRetry(params, attempt + 1);
    }

    logger.error("EmailService", "Email send failed after all retries", {
      to: params.to,
      subject: params.subject,
      err,
    });
    throw err;
  }
}

export const emailService = {
  async sendCampaignEmail(email: string, _name: string | undefined, subject: string, html: string): Promise<EmailSendResult> {
    return sendEmailWithRetry({ to: email, subject, html });
  },

  async sendWelcomeEmail(email: string, name?: string, unsubscribeToken?: string): Promise<EmailSendResult> {
    const unsubscribeUrl = unsubscribeToken
      ? `${config.clientUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`
      : undefined;
    return sendEmailWithRetry({
      to: email,
      subject: "Welcome to Dnews Africa!",
      html: buildWelcomeEmail(name, unsubscribeUrl),
    });
  },

  async sendUnsubscribeConfirmationEmail(email: string, resubscribeUrl: string): Promise<EmailSendResult> {
    return sendEmailWithRetry({
      to: email,
      subject: "You've been unsubscribed from Dnews Africa",
      html: buildUnsubscribeConfirmationEmail(resubscribeUrl),
    });
  },

  async sendResubscribeConfirmationEmail(email: string): Promise<EmailSendResult> {
    return sendEmailWithRetry({
      to: email,
      subject: "Welcome back to Dnews Africa!",
      html: buildResubscribeConfirmationEmail(),
    });
  },

  async sendArticleEmail(email: string, article: ArticleEmailData, unsubscribeToken: string): Promise<EmailSendResult> {
    const unsubscribeUrl = `${config.clientUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;
    return sendEmailWithRetry({
      to: email,
      subject: article.title,
      html: buildArticleEmail(article, unsubscribeUrl),
    });
  },

  async sendTestNewsletterEmail(email: string, name?: string, unsubscribeToken?: string): Promise<EmailSendResult> {
    const unsubscribeUrl = unsubscribeToken
      ? `${config.clientUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`
      : undefined;
    return sendEmailWithRetry({
      to: email,
      subject: "Dnews Africa - Test Newsletter",
      html: buildTestNewsletterEmail(name, unsubscribeUrl),
    });
  },
};
