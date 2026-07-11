export interface DashboardData {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  activeReaders: number;
  avgSessionDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  returningVisitors: number;
  periodStart: string;
  periodEnd: string;
  trafficSources: TrafficSource[];
  topArticles: TopArticle[];
  trending: TrendingArticle[];
  realtime: RealtimeData;
}

export interface TrafficSource {
  source: string;
  views: number;
  uniqueVisitors: number;
  percentage: number;
}

export interface TopArticle {
  articleId: string;
  title: string;
  views: number;
  uniqueReaders: number;
  avgTimeOnPage: number;
  avgScrollDepth: number;
  avgCompletionRate: number;
}

export interface TrendingArticle {
  articleId: string;
  title: string;
  viewsLastHour: number;
  uniqueReaders: number;
}

export interface RealtimeData {
  activeReaders: number;
  todayPageViews: number;
  todayVisitors: number;
  activePages: { path: string; title: string | null; activeUsers: number }[];
}

export interface ArticleAnalytics {
  articleId: string;
  totalViews: number;
  uniqueReaders: number;
  avgTimeOnPage: number;
  avgScrollDepth: number;
  avgCompletionRate: number;
  trafficSources: { source: string; views: number }[];
  dailyViews: { date: Date; views: number }[];
}

export interface AuthorAnalytics {
  authorId: string;
  totalArticles: number;
  totalViews: number;
  uniqueReaders?: number;
  avgViews: number;
  avgReadingTime: number;
  avgScrollDepth: number;
  avgCompletionRate: number;
  topArticles: { articleId: string; title: string; views: number }[];
}

export interface CategoryAnalytics {
  categoryId: number;
  totalArticles: number;
  totalViews: number;
  uniqueReaders: number;
  avgTime: number;
  topAuthors: { id: string; name: string; count: number; views: number }[];
  topStories: { articleId: string; title: string; views: number }[];
}

export interface SearchAnalytics {
  totalSearches: number;
  noResultSearches: number;
  noResultRate: number;
  popularSearches: { query: string; count: number }[];
  recentSearches: { query: string; resultsCount: number; noResults: boolean; source: string | null; createdAt: string }[];
  noResultQueries: { query: string; createdAt: string }[];
}

export interface HomepageAnalytics {
  homepageViews: number;
  sectionClicks: number;
  heroClicks: number;
  sectionClicksByType: { type: string | null; clicks: number }[];
}

export interface ReportSummary {
  generatedAt: string;
  period: { start: string; end: string; type: string };
  summary: {
    totalPageViews: number;
    uniqueVisitors: number;
    totalSessions: number;
    avgSessionDuration: number;
    bounceRate: number;
    pagesPerSession: number;
  };
  trafficSources: TrafficSource[];
  topArticles: TopArticle[];
  searchAnalytics: { totalSearches: number; noResultRate: number; popularSearches: { query: string; count: number }[] };
  homepageAnalytics: HomepageAnalytics;
  dailyTrend: { date: string; pageViews: number; uniqueVisitors: number; sessions: number }[];
}

export interface AnalyticsExport {
  id: string;
  exportType: string;
  format: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  createdAt: string;
}

export const SOURCE_LABELS: Record<string, string> = {
  DIRECT: "Direct",
  GOOGLE_SEARCH: "Google Search",
  GOOGLE_DISCOVER: "Google Discover",
  GOOGLE_NEWS: "Google News",
  FACEBOOK: "Facebook",
  TWITTER: "X (Twitter)",
  LINKEDIN: "LinkedIn",
  WHATSAPP: "WhatsApp",
  NEWSLETTER: "Newsletter",
  REFERRAL: "Referral",
  INTERNAL: "Internal",
  OTHER: "Other",
};

export const SOURCE_COLORS: Record<string, string> = {
  DIRECT: "#6b7280",
  GOOGLE_SEARCH: "#3b82f6",
  GOOGLE_DISCOVER: "#8b5cf6",
  GOOGLE_NEWS: "#ef4444",
  FACEBOOK: "#1877f2",
  TWITTER: "#000000",
  LINKEDIN: "#0a66c2",
  WHATSAPP: "#25d366",
  NEWSLETTER: "#f59e0b",
  REFERRAL: "#10b981",
  INTERNAL: "#6366f1",
  OTHER: "#9ca3af",
};

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// Legacy types used by newsletter analytics
export interface DashboardAnalytics {
  subscribers: { total: number; active: number; unsubscribed: number };
  campaigns: { sent: number; recent: { id: string; title: string; totalRecipients: number; totalOpened: number; totalClicked: number }[] };
  delivery: { total: number; delivered: number; failed: number; deliveryRate: number };
  engagement: { totalOpens: number; totalClicks: number; openRate: number; clickRate: number };
}

// Legacy type used by campaign module
export interface NewsletterAnalytics {
  totalCampaigns: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  averageOpenRate: number;
  averageClickRate: number;
  recentCampaigns: { id: string; title: string; sentAt: string; totalRecipients: number; totalOpened: number; totalClicked: number }[];
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}
