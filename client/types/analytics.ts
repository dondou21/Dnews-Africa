export interface CampaignReport {
  totalRecipients: number;
  totalSent: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  openRate: string;
  clickRate: string;
  analytics: NewsletterAnalytics[];
  recentOpens: NewsletterOpen[];
  recentClicks: NewsletterClick[];
  recipients: RecipientSummary[];
}

export interface NewsletterAnalytics {
  id: string;
  totalRecipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  failed: number;
  campaignId: string;
  createdAt: string;
}

export interface NewsletterOpen {
  id: string;
  subscriberId: string;
  openedAt: string;
  campaignId: string;
}

export interface NewsletterClick {
  id: string;
  url: string;
  articleId: string | null;
  clickedAt: string;
  campaignId: string;
  campaign?: { title: string };
}

export interface RecipientSummary {
  id: string;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  failedAt: string | null;
  errorMessage: string | null;
}

export interface DashboardAnalytics {
  subscribers: {
    total: number;
    active: number;
    unsubscribed: number;
    growth: { date: string; count: number }[];
  };
  campaigns: {
    total: number;
    sent: number;
    recent: {
      id: string;
      title: string;
      totalRecipients: number;
      totalOpened: number;
      totalClicked: number;
      sentAt: string | null;
    }[];
  };
  delivery: {
    total: number;
    delivered: number;
    failed: number;
    deliveryRate: string;
  };
  engagement: {
    totalOpens: number;
    totalClicks: number;
    openRate: string;
    clickRate: string;
  };
}
