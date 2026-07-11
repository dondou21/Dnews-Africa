export type AdType =
  | "BANNER" | "LEADERBOARD" | "SIDEBAR" | "SQUARE" | "RECTANGLE"
  | "MOBILE_BANNER" | "POPUP" | "INTERSTITIAL" | "SPONSORED_ARTICLE" | "VIDEO" | "NATIVE";

export type AdPlacement =
  | "HOMEPAGE_HERO" | "HOMEPAGE_SIDEBAR" | "HOMEPAGE_BETWEEN" | "CATEGORY_PAGES"
  | "ARTICLE_TOP" | "ARTICLE_MIDDLE" | "ARTICLE_BOTTOM" | "FOOTER" | "HEADER"
  | "NEWSLETTER" | "SEARCH_RESULTS" | "MOBILE_FEED";

export type AdStatus = "ACTIVE" | "PAUSED" | "EXPIRED" | "ARCHIVED";
export type AdRotation = "RANDOM" | "PRIORITY" | "WEIGHTED" | "SEQUENTIAL";

export interface Advertiser {
  id: string;
  companyName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  notes: string | null;
  status: string;
  _count?: { ads: number; campaigns: number };
  campaigns?: AdCampaign[];
  createdAt: string;
  updatedAt: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  budget: number | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  totalAds: number;
  advertiserId: string;
  advertiser: { id: string; companyName: string };
  _count?: { ads: number };
  ads?: Advertisement[];
  createdAt: string;
  updatedAt: string;
}

export interface Advertisement {
  id: string;
  title: string;
  type: AdType;
  placement: AdPlacement;
  targetUrl: string;
  buttonText: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  priority: number;
  status: AdStatus;
  impressions: number;
  clicks: number;
  maxImpressions: number | null;
  maxClicks: number | null;
  rotation: AdRotation;
  weight: number;
  imageId: string | null;
  image: { id: string; url: string; alt: string | null } | null;
  videoId: string | null;
  video: { id: string; url: string } | null;
  advertiserId: string;
  advertiser: { id: string; companyName: string; website?: string | null };
  campaignId: string | null;
  campaign: { id: string; name: string } | null;
  createdById: string;
  createdBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface AdvertisersResponse {
  advertisers: Advertiser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdCampaignsResponse {
  campaigns: AdCampaign[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdvertisementsResponse {
  advertisements: Advertisement[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdStats {
  total: number;
  active: number;
  paused: number;
  expired: number;
  totalImpressions: number;
  totalClicks: number;
  ctr: string;
}
