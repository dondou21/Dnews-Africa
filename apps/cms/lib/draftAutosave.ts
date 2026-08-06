export interface SeoDraftMetadata {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  focusKeyword?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageId?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImageId?: string | null;
  schemaType?: string | null;
}

export interface ArticleDraftData {
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  featuredImageId: string;
  featuredImageCaption: string;
  featuredImageCredit: string;
  featuredImageSource: string;
  featuredImageDescription: string;
  featuredImageCopyright: string;
  featuredImageLocation: string;
  featuredImageDateTaken: string;
  categoryId: number | "";
  tagsInput: string;
  status: string;
  isFeatured: boolean;
  isBreaking: boolean;
  allowComments: boolean;
  sendNewsletter: boolean;
  scheduleEnabled: boolean;
  scheduledAt: string;
  authorType: "user" | "manual";
  authorUserId: string;
  authorName: string;
  authorPosition: string;
  authorOrganization: string;
  seoMetadata?: Partial<SeoDraftMetadata>;
}

export type AutosaveStatus = "idle" | "saving" | "saved" | "unsaved" | "error";

export interface PendingDraft {
  data: ArticleDraftData;
  savedAt: string;
  serverUpdatedAt: string | null;
}

export interface ServerDraft {
  id: string;
  articleId: string | null;
  data: ArticleDraftData;
  updatedAt: string;
  createdAt: string;
}

interface LocalDraftBlob {
  v: 1;
  formKey: string;
  data: ArticleDraftData;
  savedAt: string;
  serverUpdatedAt: string | null;
}

const DRAFT_DEBOUNCE_MS = 10_000;

export const DRAFT_DEBOUNCE_MS_VALUE = DRAFT_DEBOUNCE_MS;

export function draftStorageKey(formKey: string): string {
  return `dnews_draft:${formKey}`;
}

export function readLocalDraft(formKey: string): LocalDraftBlob | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(draftStorageKey(formKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalDraftBlob;
    if (!parsed || parsed.formKey !== formKey || typeof parsed.data !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalDraft(
  formKey: string,
  data: ArticleDraftData,
  serverUpdatedAt: string | null
): void {
  if (typeof window === "undefined") return;
  try {
    const blob: LocalDraftBlob = {
      v: 1,
      formKey,
      data,
      savedAt: new Date().toISOString(),
      serverUpdatedAt,
    };
    window.localStorage.setItem(draftStorageKey(formKey), JSON.stringify(blob));
  } catch {
    // storage full or unavailable — ignore, server is the source of truth
  }
}

export function clearLocalDraft(formKey: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(draftStorageKey(formKey));
  } catch {
    // ignore
  }
}

export function draftHasContent(data: ArticleDraftData): boolean {
  if (data.title?.trim()) return true;
  if (data.slug?.trim()) return true;
  if (data.summary?.trim()) return true;
  if (data.content?.trim()) return true;
  if (data.coverImageUrl?.trim()) return true;
  if (data.coverImageAlt?.trim()) return true;
  if (data.featuredImageId?.trim()) return true;
  if (data.categoryId != null && data.categoryId !== "") return true;
  if (data.tagsInput?.trim()) return true;
  if (data.scheduledAt?.trim()) return true;
  if (data.authorName?.trim()) return true;
  if (data.seoMetadata && Object.keys(data.seoMetadata).length > 0) return true;
  return false;
}

export function isDraftStale(
  candidate: { savedAt: string; serverUpdatedAt: string | null },
  baselineUpdatedAt?: string | null
): boolean {
  if (!baselineUpdatedAt) return false;
  const baseline = Date.parse(baselineUpdatedAt);
  if (!Number.isFinite(baseline)) return false;

  const serverTime = candidate.serverUpdatedAt ? Date.parse(candidate.serverUpdatedAt) : NaN;
  const comparable = Number.isFinite(serverTime) ? serverTime : Date.parse(candidate.savedAt);
  if (!Number.isFinite(comparable)) return false;

  return comparable <= baseline;
}

export { DRAFT_DEBOUNCE_MS };
