export type NewsletterStatus = "PENDING" | "ACTIVE" | "UNSUBSCRIBED" | "BLOCKED";

export type NewsletterSource = "HOME_PAGE" | "FOOTER" | "ARTICLE" | "POPUP" | "MANUAL";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  status: NewsletterStatus;
  verified: boolean;
  verificationToken: string | null;
  verificationExpires: string | null;
  source: NewsletterSource | null;
  preferences: Record<string, unknown> | null;
  subscribedAt: string;
  unsubscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscribersResponse {
  subscribers: NewsletterSubscriber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NewsletterStats {
  total: number;
  active: number;
  pending: number;
  blocked: number;
  unsubscribed: number;
}
