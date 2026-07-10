import { config } from "../config";
import { logger } from "../utils/logger";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

function buildVerificationEmail(verifyUrl: string): string {
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
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:4px;overflow:hidden;">
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;background-color:#1a1a2e;">
              <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;">Dnews Africa</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 20px;">
              <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 16px;">Confirm your subscription</h2>
              <p style="color:#666666;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Welcome to Dnews Africa. You're almost there — click the button below to verify your email address and start receiving the latest African stories delivered to your inbox.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td align="center" style="background-color:#c0392b;border-radius:4px;padding:0;">
                    <a href="${verifyUrl}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                      Verify Subscription
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#999999;font-size:13px;line-height:1.5;margin:0;">
                If you didn't subscribe to Dnews Africa, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="color:#aaaaaa;font-size:12px;margin:0;">
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
}

export const emailService = {
  async sendCampaignEmail(email: string, name: string | undefined, subject: string, html: string): Promise<void> {
    if (config.isProduction && config.resendApiKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(config.resendApiKey);
        await resend.emails.send({
          from: config.emailFrom || "noreply@dnewsafrica.com",
          to: email,
          subject,
          html,
        });
        logger.info("CampaignService", "Campaign email sent", { email, subject });
      } catch (err) {
        logger.error("CampaignService", "Failed to send campaign email", { email, error: String(err) });
        throw err;
      }
    } else {
      logger.info("CampaignService", "Campaign email skipped (dev mode)", { email, subject });
    }
  },
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verifyUrl = `${config.clientUrl}/newsletter/verify?token=${token}`;

    if (config.isProduction && config.resendApiKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(config.resendApiKey);
        await resend.emails.send({
          from: config.emailFrom || "noreply@dnewsafrica.com",
          to: email,
          subject: "Confirm your Dnews Africa subscription",
          html: buildVerificationEmail(verifyUrl),
        });
        logger.info("EmailService", "Verification email sent", { email });
      } catch (err) {
        logger.error("EmailService", "Failed to send verification email", { email, error: String(err) });
        throw err;
      }
    } else {
      logger.info("EmailService", "Verification email skipped (dev mode)", { email, verifyUrl });
    }
  },
};
