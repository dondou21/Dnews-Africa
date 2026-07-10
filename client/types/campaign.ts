import type { NewsletterAnalytics } from "./analytics";

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "CANCELLED";
export type RecipientStatus = "PENDING" | "SENT" | "FAILED";

export interface Campaign {
  id: string;
  title: string;
  subject: string;
  slug: string;
  content: string;
  plainText: string | null;
  excerpt: string | null;
  featuredImage: string | null;
  status: CampaignStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  totalRecipients: number;
  totalSent: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  templateId: string | null;
  template?: { id: string; name: string } | null;
  createdById: string;
  createdBy: { id: string; firstName: string; lastName: string };
  updatedById: string | null;
  updatedBy: { id: string; firstName: string; lastName: string } | null;
  _count: { recipients: number };
  recipients?: CampaignRecipient[];
  analytics?: NewsletterAnalytics[];
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRecipient {
  id: string;
  status: RecipientStatus;
  sentAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  errorMessage: string | null;
  campaignId: string;
  subscriberId: string;
  subscriber: { id: string; email: string; name: string | null };
  createdAt: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CampaignStats {
  total: number;
  drafts: number;
  scheduled: number;
  sending: number;
  sent: number;
}

export interface CreateCampaignInput {
  title: string;
  subject: string;
  content?: string;
  plainText?: string;
  excerpt?: string;
  featuredImage?: string;
  status?: "DRAFT" | "SCHEDULED";
}

export interface UpdateCampaignInput {
  title?: string;
  subject?: string;
  content?: string;
  plainText?: string;
  excerpt?: string;
  featuredImage?: string;
  status?: "DRAFT" | "SCHEDULED" | "CANCELLED";
}
