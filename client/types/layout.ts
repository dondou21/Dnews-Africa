export type LayoutStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";

export type SectionType =
  | "hero_slider" | "breaking_news" | "top_stories" | "featured_story" | "trending_news"
  | "latest_news" | "category_block" | "editors_picks" | "most_read" | "most_commented"
  | "opinion" | "business" | "sports" | "innovation" | "culture" | "travel" | "lifestyle"
  | "video_section" | "photo_gallery" | "newsletter_block" | "advertisement_block"
  | "sponsor_block" | "weather_widget" | "social_feed" | "custom_html";

export interface SectionSettings {
  articleCount?: number;
  categoryId?: number;
  tag?: string;
  authorId?: string;
  sortOrder?: "latest" | "oldest" | "trending" | "popular" | "random";
  source?: "latest" | "trending" | "most_read" | "most_commented" | "editors_picks" | "manual" | "category" | "tag" | "author" | "scheduled";
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
  { value: "most_commented", label: "Most Commented", group: "Widgets" },
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
  most_commented: { articleCount: 5, source: "most_commented", layout: "list", showTitle: true },
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
