import { config } from "../config";
import { logger } from "../utils/logger";
import { buildVerificationEmail, buildWelcomeEmail, buildUnsubscribeConfirmationEmail, buildResubscribeConfirmationEmail } from "./emailTemplates";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(params: SendEmailParams): Promise<void> {
  if (config.isProduction && config.resendApiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(config.resendApiKey);
      await resend.emails.send({
        from: config.emailFrom || "noreply@dnewsafrica.com",
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      logger.info("EmailService", "Email sent", { to: params.to, subject: params.subject });
    } catch (err) {
      logger.error("EmailService", "Failed to send email", { to: params.to, error: String(err) });
      throw err;
    }
  } else {
    logger.info("EmailService", "Email skipped (dev mode)", { to: params.to, subject: params.subject });
  }
}

export const emailService = {
  async sendCampaignEmail(email: string, _name: string | undefined, subject: string, html: string): Promise<void> {
    await sendEmail({ to: email, subject, html });
  },

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${config.clientUrl}/newsletter/verify?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Confirm your Dnews Africa subscription",
      html: buildVerificationEmail(verifyUrl),
    });
  },

  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    await sendEmail({
      to: email,
      subject: "Welcome to Dnews Africa!",
      html: buildWelcomeEmail(name),
    });
  },

  async sendUnsubscribeConfirmationEmail(email: string, resubscribeUrl: string): Promise<void> {
    await sendEmail({
      to: email,
      subject: "You've been unsubscribed from Dnews Africa",
      html: buildUnsubscribeConfirmationEmail(resubscribeUrl),
    });
  },

  async sendResubscribeConfirmationEmail(email: string): Promise<void> {
    await sendEmail({
      to: email,
      subject: "Welcome back to Dnews Africa!",
      html: buildResubscribeConfirmationEmail(),
    });
  },
};
