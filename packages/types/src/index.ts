// ============================================================
// Article Types
// ============================================================

export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
  parent?: Pick<ArticleCategory, "id" | "name" | "slug"> | null;
  children?: Pick<ArticleCategory, "id" | "name" | "slug" | "description">[];
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  children: Pick<ArticleCategory, "id" | "name" | "slug" | "description">[];
}

export interface ArticleAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio?: string | null;
}

export interface ArticleTag {
  tag: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface FeaturedImage {
  id: string;
  url: string;
  alt: string | null;
  caption?: string | null;
  credit?: string | null;
  source?: string | null;
  description?: string | null;
  copyright?: string | null;
  location?: string | null;
  dateTaken?: string | null;
}

export type ArticleStatus = "IDEA" | "DRAFT" | "IN_REVIEW" | "NEEDS_REVISION" | "APPROVED" | "SCHEDULED" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage: FeaturedImage | null;
  status: ArticleStatus;
  isFeatured: boolean;
  isBreaking: boolean;
  allowComments: boolean;
  isTrending: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  archivedAt: string | null;
  changeReason: string | null;
  categoryId: number;
  category: ArticleCategory;
  authorId: string;
  author: ArticleAuthor;
  authorName: string | null;
  authorPosition: string | null;
  authorOrganization: string | null;
  assignedEditorId: string | null;
  assignedEditor?: ArticleAuthor | null;
  tags: ArticleTag[];
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesResponse {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type Category = ArticleCategory;

export interface CategoryWithCount extends Category {
  description: string | null;
  parentId: number | null;
  parent: Pick<ArticleCategory, "id" | "name" | "slug"> | null;
  children: Pick<ArticleCategory, "id" | "name" | "slug" | "description">[];
  _count: { articles: number; children: number };
  createdAt: string;
  updatedAt: string;
}

export interface TagInfo {
  id: number;
  name: string;
  slug: string;
  _count: { articles: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  featuredImageId?: string;
  featuredImageCaption?: string;
  featuredImageCredit?: string;
  featuredImageSource?: string;
  featuredImageDescription?: string;
  featuredImageCopyright?: string;
  featuredImageLocation?: string;
  featuredImageDateTaken?: string;
  categoryId: number;
  status?: ArticleStatus;
  isFeatured?: boolean;
  isBreaking?: boolean;
  allowComments?: boolean;
  isTrending?: boolean;
  publishedAt?: string;
  scheduledAt?: string;
  tags?: string[];
  authorUserId?: string;
  authorName?: string;
  authorPosition?: string;
  authorOrganization?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateArticleInput extends Partial<CreateArticleInput> {}

// ============================================================
// Auth Types
// ============================================================

export interface Role {
  id: number;
  name: string;
  description: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean;
  roleId: number;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

// ============================================================
// User Types
// ============================================================

export interface RoleInfo {
  id: number;
  name: string;
  description: string | null;
  _count?: { users: number };
  createdAt: string;
  updatedAt: string;
}

export interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean;
  roleId: number;
  role: RoleInfo;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Dashboard Types
// ============================================================

export interface DashboardStats {
  overview: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    pendingReviewArticles: number;
    rejectedArticles: number;
    archivedArticles: number;
    scheduledArticles: number;
    totalCategories: number;
    totalUsers: number;
    totalMediaFiles: number;
    newsletterSubscribers: number;
    totalContactMessages: number;
    unreadContactMessages: number;
    articlesPublishedToday: number;
    articlesPublishedThisMonth: number;
    featuredArticlesCount: number;
  };
  users: {
    totalUsers: number;
    totalAdmins: number;
    totalEditors: number;
    totalJournalists: number;
  };
  articles: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    pendingReviewArticles: number;
    rejectedArticles: number;
    archivedArticles: number;
    articlesPublishedToday: number;
    articlesPublishedThisMonth: number;
    featuredArticlesCount: number;
  };
  newsletter: {
    totalSubscribers: number;
  };
  contact: {
    totalMessages: number;
    unreadMessages: number;
  };
  media: {
    totalFiles: number;
  };
  categories: {
    totalCategories: number;
  };
}

// ============================================================
// Analytics Types
// ============================================================

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

export interface DashboardAnalytics {
  subscribers: { total: number; active: number; unsubscribed: number };
  campaigns: { sent: number; recent: { id: string; title: string; totalRecipients: number; totalOpened: number; totalClicked: number }[] };
  delivery: { total: number; delivered: number; failed: number; deliveryRate: number };
  engagement: { totalOpens: number; totalClicks: number; openRate: number; clickRate: number };
}

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

// ============================================================
// Media Types
// ============================================================

export type MediaType = "IMAGE" | "VIDEO" | "DOCUMENT" | "OTHER";

export interface MediaItem {
  id: string;
  url: string;
  alt: string | null;
  type: MediaType;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  originalName: string | null;
  filename: string | null;
  mimeType: string | null;
  extension: string | null;
  storageProvider: string;
  publicId: string | null;
  uploadedById: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Newsletter Types
// ============================================================

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

// ============================================================
// Template Types
// ============================================================

export interface NewsletterTemplate {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  content: string;
  thumbnail: string | null;
  isDefault: boolean;
  createdById: string;
  createdBy: { id: string; firstName: string; lastName: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  subject: string;
  content: string;
  thumbnail?: string;
  isDefault?: boolean;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  subject?: string;
  content?: string;
  thumbnail?: string;
  isDefault?: boolean;
}

// ============================================================
// Campaign Types
// ============================================================

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

// ============================================================
// Automation Types
// ============================================================

export type AutomationFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface NewsletterAutomation {
  id: string;
  name: string;
  enabled: boolean;
  frequency: AutomationFrequency;
  sendDay: number | null;
  sendTime: string;
  timezone: string;
  templateId: string;
  template: { id: string; name: string; subject: string };
  lastRun: string | null;
  nextRun: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationInput {
  name: string;
  frequency: AutomationFrequency;
  sendDay?: number;
  sendTime: string;
  timezone?: string;
  templateId: string;
  enabled?: boolean;
}

export interface UpdateAutomationInput {
  name?: string;
  frequency?: AutomationFrequency;
  sendDay?: number;
  sendTime?: string;
  timezone?: string;
  templateId?: string;
  enabled?: boolean;
}

// ============================================================
// Advertisement Types
// ============================================================

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

// ============================================================
// Settings Types
// ============================================================

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

// ============================================================
// Contact Types
// ============================================================

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ============================================================
// SEO Types
// ============================================================

export interface SeoMetadata {
  id?: string;
  entityType: string;
  entityId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  focusKeyword: string | null;
  robots: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageId: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImageId: string | null;
  schemaType: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeoAnalysisResult {
  score: number;
  details: Record<string, { score: number; max: number; message: string }>;
  suggestions: string[];
  grade: "excellent" | "needs_improvement" | "poor";
}

export interface Redirect {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  entityType: string | null;
  entityId: string | null;
  active: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RedirectsResponse {
  redirects: Redirect[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface SeoSettings {
  id: number;
  siteTitle: string;
  defaultDescription: string;
  defaultImageUrl: string | null;
  defaultRobots: string;
  organizationName: string;
  organizationLogo: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialLinkedin: string | null;
  googleNewsPubName: string | null;
  googleNewsPubLogo: string | null;
}

export interface SeoReport {
  stats: {
    totalArticles: number;
    missingMetaDesc: number;
    missingFeaturedImage: number;
    excellent: number;
    needsImprovement: number;
    poor: number;
    avgScore: number;
  };
  articles: Array<{
    articleId: string;
    title: string;
    slug: string;
    status: string;
    score: number;
    titleScore: number;
    descriptionScore: number;
    keywordScore: number;
    imageScore: number;
    socialScore: number;
    suggestions: string[];
  }>;
}

// ============================================================
// Editorial Types
// ============================================================

export type ApprovalDecision = "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";

export type AuditAction =
  | "CREATED" | "EDITED" | "SUBMITTED" | "APPROVED" | "REJECTED"
  | "CHANGES_REQUESTED" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED"
  | "RESTORED" | "ASSIGNED";

export interface ArticleRevision {
  id: string;
  articleId: string;
  version: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featuredImageId: string | null;
  changeReason: string | null;
  changedById: string;
  changedBy: ArticleAuthor;
  createdAt: string;
}

export interface EditorialApproval {
  id: string;
  articleId: string;
  decision: ApprovalDecision;
  notes: string | null;
  reviewerId: string;
  reviewer: ArticleAuthor;
  createdAt: string;
}

export interface ArticleAuditLog {
  id: string;
  articleId: string;
  action: AuditAction;
  fromStatus: string | null;
  toStatus: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  userId: string;
  user: ArticleAuthor;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  userId: string;
  articleId: string | null;
  createdAt: string;
}

export interface WorkflowStats {
  myDrafts: number;
  pendingReviews: number;
  needsRevision: number;
  scheduledCount: number;
  publishedToday: number;
}

export interface WorkflowArticle extends Article {
  assignedEditor?: ArticleAuthor | null;
  category: ArticleCategory;
  author: ArticleAuthor;
  tags: ArticleTag[];
}

export interface WorkflowArticleResponse {
  article: WorkflowArticle;
  revisions: ArticleRevision[];
  approvals: EditorialApproval[];
  auditLogs: ArticleAuditLog[];
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface EditorOption {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string;
}

// ============================================================
// Layout Types
// ============================================================

export type LayoutStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";

export type SectionType =
  | "hero_slider" | "breaking_news" | "top_stories" | "featured_story" | "trending_news"
  | "latest_news" | "category_block" | "editors_picks" | "most_read"
  | "opinion" | "business" | "sports" | "innovation" | "culture" | "travel" | "lifestyle"
  | "video_section" | "photo_gallery" | "newsletter_block" | "advertisement_block"
  | "sponsor_block" | "weather_widget" | "social_feed" | "custom_html";

export interface SectionSettings {
  articleCount?: number;
  categoryId?: number;
  tag?: string;
  authorId?: string;
  sortOrder?: "latest" | "oldest" | "trending" | "popular" | "random";
  source?: "latest" | "trending" | "most_read" | "editors_picks" | "manual" | "category" | "tag" | "author" | "scheduled";
  manualArticleIds?: string[];
  adPlacement?: string;
  adCampaignId?: string;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  theme?: "light" | "dark" | "custom";
  customHtml?: string;
  autoPlay?: boolean;
  slideInterval?: number;
  showTitle?: boolean;
  showExcerpt?: boolean;
  imageSize?: "small" | "medium" | "large" | "full";
  layout?: "grid" | "list" | "carousel" | "masonry" | "compact";
}

export interface Section {
  id?: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  position: number;
  visible: boolean;
  settings: SectionSettings | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LayoutUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface HomePageLayout {
  id: string;
  name: string;
  slug: string;
  status: LayoutStatus;
  version: number;
  isDefault: boolean;
  scheduledAt: string | null;
  publishedAt: string | null;
  settings: Record<string, unknown> | null;
  sections: Section[];
  createdBy: LayoutUser;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  _count?: { sections: number };
}

export interface LayoutListResponse {
  layouts: HomePageLayout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateLayoutInput {
  name: string;
  slug: string;
  status?: LayoutStatus;
  isDefault?: boolean;
  scheduledAt?: string;
  settings?: Record<string, unknown>;
  sections?: Section[];
}

export interface UpdateLayoutInput extends Partial<CreateLayoutInput> {
  slug?: never;
}

export const SECTION_TYPES: { value: string; label: string; group: string }[] = [
  { value: "hero_slider", label: "Hero Slider", group: "Hero" },
  { value: "breaking_news", label: "Breaking News", group: "Hero" },
  { value: "top_stories", label: "Top Stories", group: "Hero" },
  { value: "featured_story", label: "Featured Story", group: "Featured" },
  { value: "trending_news", label: "Trending News", group: "News" },
  { value: "latest_news", label: "Latest News", group: "News" },
  { value: "category_block", label: "Category Block", group: "Content" },
  { value: "editors_picks", label: "Editor's Picks", group: "Featured" },
  { value: "most_read", label: "Most Read", group: "Widgets" },
  { value: "opinion", label: "Opinion", group: "Content" },
  { value: "business", label: "Business", group: "Content" },
  { value: "sports", label: "Sports", group: "Content" },
  { value: "innovation", label: "Innovation", group: "Content" },
  { value: "culture", label: "Culture", group: "Content" },
  { value: "travel", label: "Travel", group: "Content" },
  { value: "lifestyle", label: "Lifestyle", group: "Content" },
  { value: "video_section", label: "Video Section", group: "Multimedia" },
  { value: "photo_gallery", label: "Photo Gallery", group: "Multimedia" },
  { value: "newsletter_block", label: "Newsletter Signup", group: "Widgets" },
  { value: "advertisement_block", label: "Advertisement", group: "Widgets" },
  { value: "sponsor_block", label: "Sponsor Block", group: "Widgets" },
  { value: "weather_widget", label: "Weather Widget", group: "Widgets" },
  { value: "social_feed", label: "Social Feed", group: "Widgets" },
  { value: "custom_html", label: "Custom HTML", group: "Advanced" },
];

export const DEFAULT_SECTION_SETTINGS: Record<string, Partial<SectionSettings>> = {
  hero_slider: { articleCount: 5, autoPlay: true, slideInterval: 5000, layout: "carousel", showTitle: true, showExcerpt: false, imageSize: "large" },
  breaking_news: { articleCount: 10, sortOrder: "latest", layout: "list", showTitle: true },
  top_stories: { articleCount: 6, source: "latest", layout: "grid", imageSize: "medium", showTitle: true, showExcerpt: true },
  featured_story: { articleCount: 1, source: "editors_picks", layout: "compact", imageSize: "large", showTitle: true, showExcerpt: true },
  trending_news: { articleCount: 5, source: "trending", layout: "list", showTitle: true },
  latest_news: { articleCount: 10, source: "latest", layout: "list", showTitle: true, showExcerpt: false },
  category_block: { articleCount: 4, layout: "grid", imageSize: "medium", showTitle: true, showExcerpt: true },
  editors_picks: { articleCount: 4, source: "editors_picks", layout: "grid", imageSize: "medium", showTitle: true },
  most_read: { articleCount: 5, source: "most_read", layout: "list", showTitle: true },
  opinion: { articleCount: 4, source: "latest", layout: "grid", imageSize: "medium", showTitle: true },
  business: { articleCount: 6, categoryId: undefined, layout: "grid", imageSize: "medium" },
  sports: { articleCount: 6, categoryId: undefined, layout: "grid", imageSize: "medium" },
  innovation: { articleCount: 4, categoryId: undefined, layout: "grid", imageSize: "medium" },
  culture: { articleCount: 4, categoryId: undefined, layout: "grid", imageSize: "medium" },
  travel: { articleCount: 4, categoryId: undefined, layout: "grid", imageSize: "medium" },
  lifestyle: { articleCount: 4, categoryId: undefined, layout: "grid", imageSize: "medium" },
  video_section: { articleCount: 6, layout: "carousel", imageSize: "medium" },
  photo_gallery: { articleCount: 10, layout: "carousel", imageSize: "large" },
  newsletter_block: { showTitle: true },
  advertisement_block: { adPlacement: "banner" },
  sponsor_block: { theme: "light", showTitle: true },
  weather_widget: { theme: "light" },
  social_feed: { showTitle: true },
  custom_html: { theme: "light" },
};

// ============================================================
// Content Block Types
// ============================================================

export type ContentBlockType =
  | "paragraph"
  | "heading"
  | "quote"
  | "image"
  | "imageGallery"
  | "video"
  | "divider"
  | "pullQuote"
  | "bulletList"
  | "numberedList"
  | "table"
  | "embed"
  | "relatedArticle"
  | "callout";

export type HeadingLevel = "h2" | "h3" | "h4";
export type ImageAlignment = "full" | "left" | "center" | "right";
export type ImageSize = "small" | "medium" | "large" | "fullWidth";
export type CalloutVariant = "info" | "warning" | "tip" | "quote";

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  data: Record<string, unknown>;
}

export interface ConversionWarning {
  blockId: string;
  type: ContentBlockType;
  message: string;
}

export function createBlockId(): string {
  return "blk_" + Math.random().toString(36).substring(2, 11);
}

export function createBlock(type: ContentBlockType, data?: Record<string, unknown>): ContentBlock {
  return { id: createBlockId(), type, data: data ?? {} };
}

export function serializeContent(blocks: ContentBlock[]): string {
  return JSON.stringify(blocks);
}

export function deserializeContent(content: string): ContentBlock[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type && parsed[0].id) {
      return parsed as ContentBlock[];
    }
    return [];
  } catch {
    return [];
  }
}

export function isContentBlocks(content: string): boolean {
  if (!content) return false;
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.length > 0 && "type" in parsed[0] && "id" in parsed[0];
  } catch {
    return false;
  }
}

function detectMarkdownLine(line: string): { type: ContentBlockType; data: Record<string, unknown> } | null {
  const trimmed = line.trim();

  const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    const hLevel = level <= 2 ? "h2" : level === 3 ? "h3" : "h4";
    return { type: "heading", data: { text: headingMatch[2], level: hLevel } };
  }

  if (trimmed.startsWith("> ")) {
    const text = trimmed.replace(/^> /, "");
    const parts = text.split("—").map((s) => s.trim());
    if (parts.length > 1) {
      return { type: "quote", data: { text: parts[0], attribution: parts[1] } };
    }
    return { type: "quote", data: { text, attribution: "" } };
  }

  return null;
}

export function plainTextToBlocks(text: string): { blocks: ContentBlock[]; warnings: ConversionWarning[] } {
  const lines = text.split("\n");
  const blocks: ContentBlock[] = [];
  const warnings: ConversionWarning[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (trimmed === "---") {
      blocks.push(createBlock("divider", {}));
      i++;
      continue;
    }

    const md = detectMarkdownLine(line);
    if (md) {
      blocks.push(createBlock(md.type, md.data));
      i++;
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].trimStart().startsWith("- ") || lines[i].trimStart().startsWith("* "))) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(createBlock("bulletList", { items }));
      continue;
    }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push(createBlock("numberedList", { items }));
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      const text = paraLines.map((l) => l.trim()).join("\n");
      blocks.push(createBlock("paragraph", { text }));
    }
  }

  if (blocks.length === 0) {
    blocks.push(createBlock("paragraph", { text: "" }));
  }

  return { blocks, warnings };
}

export function blocksToPlainText(blocks: ContentBlock[]): { text: string; warnings: ConversionWarning[] } {
  const parts: string[] = [];
  const warnings: ConversionWarning[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "paragraph": {
        const pText = String(block.data.text ?? "");
        parts.push(pText);
        parts.push("");
        break;
      }

      case "heading": {
        const level = String(block.data.level ?? "h2");
        const prefix = level === "h2" ? "##" : level === "h3" ? "###" : "####";
        parts.push(`${prefix} ${String(block.data.text ?? "")}`);
        parts.push("");
        break;
      }

      case "quote": {
        const text = String(block.data.text ?? "");
        const attribution = String(block.data.attribution ?? "");
        if (attribution) {
          parts.push(`> ${text} — ${attribution}`);
        } else {
          parts.push(`> ${text}`);
        }
        parts.push("");
        break;
      }

      case "pullQuote": {
        const text = String(block.data.text ?? "");
        const attribution = String(block.data.attribution ?? "");
        parts.push(`> ${text}`);
        if (attribution) parts.push(`> — ${attribution}`);
        parts.push("");
        break;
      }

      case "bulletList": {
        const items = (block.data.items as string[]) ?? [];
        for (const item of items) {
          parts.push(`- ${item}`);
        }
        parts.push("");
        break;
      }

      case "numberedList": {
        const items = (block.data.items as string[]) ?? [];
        items.forEach((item, idx) => {
          parts.push(`${idx + 1}. ${item}`);
        });
        parts.push("");
        break;
      }

      case "divider":
        parts.push("---");
        parts.push("");
        break;

      case "image":
        warnings.push({ blockId: block.id, type: "image", message: `Image: ${block.data.url ?? "(no URL)"}` });
        parts.push(`[Image: ${String(block.data.alt ?? block.data.caption ?? "image")}]`);
        parts.push("");
        break;

      case "imageGallery":
        warnings.push({ blockId: block.id, type: "imageGallery", message: "Image gallery with " + String(((block.data.items as Array<unknown>) ?? []).length) + " images" });
        parts.push(`[Image Gallery: ${String(block.data.caption ?? "gallery")}]`);
        parts.push("");
        break;

      case "video":
        warnings.push({ blockId: block.id, type: "video", message: `Video: ${block.data.url ?? "(no URL)"}` });
        parts.push(`[Video: ${String(block.data.caption ?? "video")}]`);
        parts.push("");
        break;

      case "table":
        warnings.push({ blockId: block.id, type: "table", message: `Table with ${((block.data.rows as Array<unknown>) ?? []).length} rows` });
        parts.push(`[Table]`);
        parts.push("");
        break;

      case "embed":
        warnings.push({ blockId: block.id, type: "embed", message: `Embed: ${block.data.url ?? "(no URL)"}` });
        parts.push(`[Embed: ${String(block.data.caption ?? "embed")}]`);
        parts.push("");
        break;

      case "relatedArticle":
        warnings.push({ blockId: block.id, type: "relatedArticle", message: `Related article: ${block.data.url ?? "(no URL)"}` });
        parts.push(`[Related Article: ${String(block.data.title ?? "link")}]`);
        parts.push("");
        break;

      case "callout":
        parts.push(`[${String((block.data.variant ?? "info")).toUpperCase()}] ${String(block.data.title ?? "")}`);
        parts.push(String(block.data.text ?? ""));
        parts.push("");
        break;

      default:
        parts.push(String(block.data.text ?? ""));
        parts.push("");
    }
  }

  return { text: parts.join("\n").trim(), warnings };
}
