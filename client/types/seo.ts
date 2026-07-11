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
