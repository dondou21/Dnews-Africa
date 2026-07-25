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

function buildWelcomeEmail(name?: string): string {
  const greeting = name ? `Hi ${name},` : "Hello,";
  const unsubscribeUrl = `${config.clientUrl}/newsletter/unsubscribe`;
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Dnews Africa</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width:100%;">
    <tr>
      <td align="center" style="padding:30px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;background-color:#1a1a2e;">
              <h1 style="color:#ffffff;font-size:26px;margin:0;font-weight:700;letter-spacing:-0.5px;font-family:Georgia,'Times New Roman',serif;">Dnews Africa</h1>
              <p style="color:#c0392b;font-size:11px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Independent. Informed. Influential.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 0;">
              <h2 style="color:#1a1a2e;font-size:22px;margin:0 0 8px;font-weight:700;font-family:Georgia,'Times New Roman',serif;">Welcome to Dnews Africa</h2>
              <p style="color:#666666;font-size:15px;line-height:1.7;margin:0 0 6px;">${greeting}</p>
              <p style="color:#666666;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Thank you for joining our community of informed readers across the continent and beyond. You are now confirmed and will receive the best of African journalism delivered directly to your inbox.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f8;border-radius:6px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <h3 style="color:#1a1a2e;font-size:14px;margin:0 0 16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">What You'll Receive</h3>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        ["Breaking News", "Real-time updates on major stories across Africa"],
                        ["Politics & Policy", "In-depth analysis of political developments"],
                        ["Business & Economy", "Markets, trade, and economic insights"],
                        ["Technology & Innovation", "Africa's growing tech ecosystem"],
                        ["Sports", "Coverage of African athletics and global events"],
                        ["Culture & Arts", "Music, film, literature, and cultural trends"],
                        ["Weekly Highlights", "Curated top stories every week"],
                        ["Exclusive Editorials", "Expert opinions and investigative reports"],
                      ].map(([title, desc]) => `
                      <tr>
                        <td style="padding:6px 0;border-bottom:1px solid #e8e8e8;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="16" style="vertical-align:top;padding-top:2px;"><span style="color:#c0392b;font-size:16px;">&bull;</span></td>
                              <td><p style="margin:0;color:#333333;font-size:14px;line-height:1.5;"><strong>${title}:</strong> ${desc}</p></td>
                            </tr>
                          </table>
                        </td>
                      </tr>`).join("")}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="background-color:#c0392b;border-radius:4px;padding:0;">
                    <a href="https://dnewsafrica.com" target="_blank" style="display:inline-block;padding:14px 40px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.5px;font-family:'Helvetica Neue',Arial,sans-serif;">Explore Dnews Africa</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;">
                    <p style="color:#999999;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Follow Us</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        ${[
                          ["Twitter / X", "https://x.com/dnewsafrica"],
                          ["Facebook", "https://facebook.com/dnewsafrica"],
                          ["Instagram", "https://instagram.com/dnewsafrica"],
                          ["YouTube", "https://youtube.com/@dnewsafrica"],
                        ].map(([name, url]) => `
                        <td style="padding:0 6px;">
                          <a href="${url}" target="_blank" style="display:inline-block;padding:8px 14px;border:1px solid #e0e0e0;border-radius:4px;color:#666666;text-decoration:none;font-size:12px;font-weight:500;">${name}</a>
                        </td>`).join("")}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 0;border-top:1px solid #eeeeee;">
              <p style="color:#999999;font-size:12px;line-height:1.6;margin:0 0 4px;text-align:center;">
                Questions or feedback? Contact us at <a href="mailto:contact@dnewsafrica.com" style="color:#c0392b;text-decoration:underline;">contact@dnewsafrica.com</a>
              </p>
              <p style="color:#aaaaaa;font-size:11px;line-height:1.6;margin:0 0 20px;text-align:center;">
                You are receiving this because you subscribed to the Dnews Africa newsletter.
                <br><a href="${unsubscribeUrl}" style="color:#999999;text-decoration:underline;">Unsubscribe</a> at any time.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 40px 24px;text-align:center;background-color:#fafafa;border-top:1px solid #eeeeee;">
              <p style="color:#bbbbbb;font-size:11px;margin:0;line-height:1.5;">
                &copy; ${year} Dnews Africa. All rights reserved.
                <br>Dnews Africa Media Group, Accra, Ghana.
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
  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    if (config.isProduction && config.resendApiKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(config.resendApiKey);
        await resend.emails.send({
          from: config.emailFrom || "noreply@dnewsafrica.com",
          to: email,
          subject: "Welcome to Dnews Africa!",
          html: buildWelcomeEmail(name),
        });
        logger.info("EmailService", "Welcome email sent", { email });
      } catch (err) {
        logger.error("EmailService", "Failed to send welcome email", { email, error: String(err) });
      }
    } else {
      logger.info("EmailService", "Welcome email skipped (dev mode)", { email });
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
