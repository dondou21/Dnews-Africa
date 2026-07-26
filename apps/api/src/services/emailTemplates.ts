const brandDark = "#1a1a2e";
const brandRed = "#c0392b";
const textDark = "#333333";
const textMuted = "#666666";
const textLight = "#999999";
const bgLight = "#f4f4f4";
const bgWhite = "#ffffff";
const borderColor = "#eeeeee";

function wrapper(content: string, previewText?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  ${previewText ? `<!--[if !mso]><!-- -->
  <style>
    @media (prefers-color-scheme: dark) {
      .dark-bg { background-color: #0f0f0f !important; }
      .dark-card { background-color: #1a1a2e !important; }
      .dark-text { color: #e5e5e5 !important; }
      .dark-muted { color: #a0a0a0 !important; }
    }
  </style>
  <!--<![endif]-->` : ""}
  <title>Dnews Africa</title>
</head>
<body style="margin:0;padding:0;background-color:${bgLight};font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;" class="dark-bg">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width:100%;">
    <tr>
      <td align="center" style="padding:30px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${bgWhite};border-radius:6px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);" class="dark-card">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function header(): string {
  return `<tr>
    <td style="padding:32px 40px 24px;text-align:center;background-color:${brandDark};">
      <h1 style="color:#ffffff;font-size:26px;margin:0;font-weight:700;letter-spacing:-0.5px;font-family:Georgia,'Times New Roman',serif;">Dnews Africa</h1>
      <p style="color:${brandRed};font-size:11px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Independent. Informed. Influential.</p>
    </td>
  </tr>`;
}

function footer(unsubscribeUrl?: string): string {
  return `<tr>
    <td style="padding:32px 40px 0;border-top:1px solid ${borderColor};">
      <p style="color:${textLight};font-size:12px;line-height:1.6;margin:0 0 4px;text-align:center;">
        Questions or feedback? <a href="mailto:contact@dnewsafrica.com" style="color:${brandRed};text-decoration:underline;">contact@dnewsafrica.com</a>
      </p>
      ${unsubscribeUrl ? `<p style="color:#aaaaaa;font-size:11px;line-height:1.6;margin:0 0 20px;text-align:center;">
        You are receiving this because you subscribed to the Dnews Africa newsletter.
        <br><a href="${unsubscribeUrl}" style="color:#999999;text-decoration:underline;">Unsubscribe</a> at any time.
      </p>` : ""}
    </td>
  </tr>
  <tr>
    <td style="padding:16px 40px 24px;text-align:center;background-color:#fafafa;border-top:1px solid ${borderColor};">
      <p style="color:#bbbbbb;font-size:11px;margin:0;line-height:1.5;">
        &copy; ${new Date().getFullYear()} Dnews Africa. All rights reserved.
        <br>Dnews Africa Media Group, Accra, Ghana.
      </p>
    </td>
  </tr>`;
}

function ctaButton(url: string, text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td align="center" style="background-color:${brandRed};border-radius:4px;padding:0;">
        <a href="${url}" target="_blank" style="display:inline-block;padding:14px 40px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.5px;font-family:'Helvetica Neue',Arial,sans-serif;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function socialLinks(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center;">
        <p style="color:${textLight};font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Follow Us</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="padding:0 6px;"><a href="https://x.com/dnewsafrica" target="_blank" style="display:inline-block;padding:8px 14px;border:1px solid #e0e0e0;border-radius:4px;color:${textMuted};text-decoration:none;font-size:12px;font-weight:500;">Twitter / X</a></td>
            <td style="padding:0 6px;"><a href="https://facebook.com/dnewsafrica" target="_blank" style="display:inline-block;padding:8px 14px;border:1px solid #e0e0e0;border-radius:4px;color:${textMuted};text-decoration:none;font-size:12px;font-weight:500;">Facebook</a></td>
            <td style="padding:0 6px;"><a href="https://instagram.com/dnewsafrica" target="_blank" style="display:inline-block;padding:8px 14px;border:1px solid #e0e0e0;border-radius:4px;color:${textMuted};text-decoration:none;font-size:12px;font-weight:500;">Instagram</a></td>
            <td style="padding:0 6px;"><a href="https://youtube.com/@dnewsafrica" target="_blank" style="display:inline-block;padding:8px 14px;border:1px solid #e0e0e0;border-radius:4px;color:${textMuted};text-decoration:none;font-size:12px;font-weight:500;">YouTube</a></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

export function buildWelcomeEmail(name?: string, unsubscribeUrl?: string): string {
  const greeting = name
    ? `Hello ${name},`
    : "Hello Reader,";
  const contentCategories = [
    ["Breaking News", "Real-time updates on major stories across Africa"],
    ["Politics", "In-depth analysis of political developments across the continent"],
    ["Business", "Markets, trade, and economic insights"],
    ["Technology", "Africa's growing tech ecosystem and digital transformation"],
    ["Sports", "Coverage of African athletics, AFCON, and global events"],
    ["Health", "Health coverage and public health developments"],
    ["Entertainment", "Music, film, television, and cultural trends"],
    ["Culture", "Arts, literature, fashion, and cultural movements"],
  ];

  const categoryRows = contentCategories.map(([title, desc]) => `
              <tr>
                <td style="padding:8px 0;border-bottom:1px solid ${borderColor};">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="20" style="vertical-align:top;padding-top:1px;"><span style="color:${brandRed};font-size:18px;line-height:1;">&bull;</span></td>
                      <td>
                        <p style="margin:0;color:${brandDark};font-size:14px;line-height:1.6;font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;" class="dark-text"><strong>${title}</strong> &mdash; ${desc}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`).join("");

  return wrapper(`
    ${header()}
    <tr>
      <td style="padding:40px 40px 16px;">
        <p style="color:${textMuted};font-size:16px;line-height:1.7;margin:0 0 4px;font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;" class="dark-muted">${greeting}</p>
        <p style="color:${textMuted};font-size:16px;line-height:1.7;margin:0 0 20px;font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;" class="dark-muted">
          Welcome to Dnews Africa! Thank you for joining our community of readers who stay informed about the stories that shape the continent.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 8px;">
        <h2 style="color:${brandDark};font-size:20px;margin:0 0 6px;font-weight:700;font-family:Georgia,'Times New Roman',serif;" class="dark-text">What You'll Receive</h2>
        <p style="color:${textMuted};font-size:14px;line-height:1.6;margin:0 0 20px;font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;" class="dark-muted">
          As a subscriber, you'll get the following delivered directly to your inbox:
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f8;border-radius:8px;">
          <tr>
            <td style="padding:20px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${categoryRows}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f8;border-radius:0 0 8px 8px;">
          <tr>
            <td style="padding:0 24px 20px;">
              <p style="color:${brandDark};font-size:14px;line-height:1.6;margin:0;font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;" class="dark-text"><strong>Plus:</strong> Weekly Editorial Picks and Special Reports curated by our editors.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px 0;text-align:center;">
        ${ctaButton("https://dnewsafrica.com", "Visit Dnews Africa")}
      </td>
    </tr>
    <tr>
      <td style="padding:32px 40px 0;">
        ${socialLinks()}
      </td>
    </tr>
    ${footer(unsubscribeUrl)}
  `, "Welcome to Dnews Africa!");
}

export function buildUnsubscribeConfirmationEmail(unsubscribeUrl: string): string {
  return wrapper(`
    ${header()}
    <tr>
      <td style="padding:40px 40px 20px;">
        <h2 style="color:${brandDark};font-size:22px;margin:0 0 8px;font-weight:700;font-family:Georgia,'Times New Roman',serif;" class="dark-text">You've been unsubscribed</h2>
        <p style="color:${textMuted};font-size:15px;line-height:1.7;margin:0 0 6px;" class="dark-muted">We're sorry to see you go.</p>
        <p style="color:${textMuted};font-size:15px;line-height:1.7;margin:0 0 24px;" class="dark-muted">
          You have been successfully unsubscribed from the Dnews Africa newsletter. You will no longer receive emails from us.
        </p>
        <p style="color:${textMuted};font-size:15px;line-height:1.7;margin:0 0 24px;" class="dark-muted">
          If you change your mind, you can resubscribe at any time.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;text-align:center;">
        ${ctaButton(unsubscribeUrl, "Resubscribe to Dnews Africa")}
      </td>
    </tr>
    ${footer()}
  `, "Unsubscribe confirmation from Dnews Africa");
}

export function buildResubscribeConfirmationEmail(): string {
  return wrapper(`
    ${header()}
    <tr>
      <td style="padding:40px 40px 20px;">
        <h2 style="color:${brandDark};font-size:22px;margin:0 0 8px;font-weight:700;font-family:Georgia,'Times New Roman',serif;" class="dark-text">Welcome back!</h2>
        <p style="color:${textMuted};font-size:15px;line-height:1.7;margin:0 0 24px;" class="dark-muted">
          You have been successfully resubscribed to the Dnews Africa newsletter. A confirmation email has been sent to verify your subscription.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;text-align:center;">
        ${ctaButton("https://dnewsafrica.com", "Visit Dnews Africa")}
      </td>
    </tr>
    ${footer()}
  `, "Welcome back to Dnews Africa!");
}
