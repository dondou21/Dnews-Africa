export interface NewsletterSettings {
  id: number;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  companyName: string;
  footerText: string;
  logoUrl: string | null;
  timezone: string;
  defaultTemplateId: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialLinkedin: string | null;
  createdAt: string;
  updatedAt: string;
}
