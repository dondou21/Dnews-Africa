"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Lock, SearchIcon } from "lucide-react";
import { get, patch, post, put } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import RoleGuard from "@/components/dashboard/RoleGuard";
import LoadingState from "@/components/dashboard/LoadingState";
import CoverImageUpload from "@/components/dashboard/CoverImageUpload";
import CategorySelect from "@/components/dashboard/CategorySelect";
import SeoMetadataForm from "@/components/seo/SeoMetadataForm";
import type { Article, Category } from "@/types/article";
import type { SeoMetadata } from "@/types/seo";

export default function EditArticlePage() {
  return (
    <RoleGuard roles={["Admin", "Editor", "Journalist"]}>
      <EditArticleForm />
    </RoleGuard>
  );
}

function EditArticleForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const isJournalist = user?.role.name === "Journalist";

  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [featuredImageId, setFeaturedImageId] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<string>("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [seoMetadata, setSeoMetadata] = useState<Partial<SeoMetadata>>({});
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoSaving, setSeoSaving] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [articleData, cats] = await Promise.all([
          get<Article>(`/articles/admin/${id}`),
          get<Category[]>("/categories"),
        ]);
        setArticle(articleData);
        setCategories(cats);
        setCategoriesLoading(false);

        setTitle(articleData.title);
        setSlug(articleData.slug);
        setSummary(articleData.summary);
        setContent(articleData.content);
        setCoverImageUrl(articleData.coverImageUrl || "");
        setCoverImageAlt(articleData.coverImageAlt || "");
        setCategoryId(articleData.categoryId);
        setStatus(articleData.status as any);
        setIsFeatured(articleData.isFeatured);
        if (articleData.scheduledAt) {
          setScheduleEnabled(true);
          setScheduledAt(new Date(articleData.scheduledAt).toISOString().slice(0, 16));
        }
        setTagsInput(
          articleData.tags.map((t) => t.tag.name).join(", ")
        );

        get<SeoMetadata>(`/articles/${id}/seo`).then((seo) => {
          setSeoMetadata(seo ?? {});
        }).catch(() => {});
      } catch {
        setError("Failed to load article.");
        setCategoriesLoading(false);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !slug || !summary || !content || !categoryId) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    const tags = tagsInput
      ? tagsInput.split(",").map((t) => t.trim().toLowerCase().replace(/\s+/g, "-")).filter(Boolean)
      : undefined;

    try {
      const finalStatus = scheduleEnabled ? "SCHEDULED" : isJournalist ? "DRAFT" : status;
      await patch(`/articles/${id}`, {
        title,
        slug,
        summary,
        content,
        coverImageUrl: coverImageUrl || undefined,
        coverImageAlt: coverImageAlt || undefined,
        featuredImageId: featuredImageId || undefined,
        categoryId: Number(categoryId),
        status: finalStatus,
        isFeatured,
        tags,
        scheduledAt: scheduleEnabled && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      });
      router.push("/dashboard/articles");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update article.";
      setError(msg);
      setSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    setError("");
    setSubmittingReview(true);
    try {
      await post(`/editorial/articles/${id}/submit`, {});
      router.push("/dashboard/articles");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit for review.";
      setError(msg);
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded bg-dnews-border/50 animate-pulse" />
          <div>
            <div className="h-6 w-48 rounded bg-dnews-border/50 animate-pulse" />
            <div className="mt-1 h-4 w-32 rounded bg-dnews-border/50 animate-pulse" />
          </div>
        </div>
        <LoadingState variant="card" rows={3} />
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/articles"
            className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-gray transition-colors hover:bg-dnews-light-gray"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-heading text-xl font-bold text-dnews-dark">
              Article Not Found
            </h2>
          </div>
        </div>
        <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/articles"
          className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-gray transition-colors hover:bg-dnews-light-gray"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">
            Edit Article
          </h2>
          <p className="text-sm text-dnews-muted">
            Editing: {article?.title}
          </p>
        </div>
      </div>

      {error && (
        <div ref={errorRef} className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      )}

      {isJournalist && article && article.status !== "DRAFT" && article.status !== "IDEA" && article.status !== "NEEDS_REVISION" && (
        <div className="rounded-sm border border-dnews-accent/30 bg-dnews-accent/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-dnews-accent" />
            <p className="text-xs font-medium text-dnews-accent">
              This article is in {article.status.replace(/_/g, " ").toLowerCase()} status and is locked for editing.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">
            Article Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Title <span className="text-dnews-red">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Slug <span className="text-dnews-red">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark font-mono outline-none transition-colors focus:border-dnews-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Summary / Excerpt <span className="text-dnews-red">*</span>
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                rows={3}
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Content <span className="text-dnews-red">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={12}
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark font-mono outline-none transition-colors focus:border-dnews-accent"
              />
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">
            Media
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Cover Image
              </label>
              <CoverImageUpload
                initialUrl={coverImageUrl}
                initialAlt={coverImageAlt}
                onImageChange={(url, alt, mediaId) => {
                  setCoverImageUrl(url);
                  setCoverImageAlt(alt);
                  if (mediaId) setFeaturedImageId(mediaId);
                }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">
            Organization
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Category <span className="text-dnews-red">*</span>
              </label>
              <CategorySelect
                categories={categories}
                loading={categoriesLoading}
                value={categoryId}
                onChange={(id) => setCategoryId(id)}
                required
              />
              {!categoriesLoading && categories.length === 0 && (
                <p className="mt-1 text-xs text-dnews-red">
                  No categories found. Create one in Categories first.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
              />
              <p className="mt-1 text-xs text-dnews-muted">
                Comma-separated tags. Tags will be created automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">
            Publishing
          </h3>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Status
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="DRAFT"
                    checked={status === "DRAFT" && !scheduleEnabled}
                    onChange={() => { setStatus("DRAFT"); setScheduleEnabled(false); }}
                    disabled={isJournalist && article?.status !== "DRAFT" && article?.status !== "IDEA" && article?.status !== "NEEDS_REVISION"}
                    className="accent-dnews-accent"
                  />
                  <span className="text-sm text-dnews-dark">Draft</span>
                </label>
                {!isJournalist && (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="PUBLISHED"
                        checked={status === "PUBLISHED"}
                        onChange={() => { setStatus("PUBLISHED"); setScheduleEnabled(false); }}
                        className="accent-dnews-accent"
                      />
                      <span className="text-sm text-dnews-dark">Published</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="ARCHIVED"
                        checked={status === "ARCHIVED"}
                        onChange={() => { setStatus("ARCHIVED"); setScheduleEnabled(false); }}
                        className="accent-dnews-accent"
                      />
                      <span className="text-sm text-dnews-dark">Archived</span>
                    </label>
                  </>
                )}
              </div>
            </div>

            {!isJournalist && (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleEnabled}
                    onChange={(e) => {
                      setScheduleEnabled(e.target.checked);
                      if (e.target.checked) setStatus("DRAFT");
                    }}
                    className="h-4 w-4 accent-dnews-accent"
                  />
                  <span className="text-sm text-dnews-dark">Schedule for later</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 accent-dnews-accent"
                  />
                  <span className="text-sm text-dnews-dark">Featured article</span>
                </label>
              </>
            )}
          </div>

          {scheduleEnabled && (
            <div className="mt-4 border-t border-dnews-border pt-4">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Schedule Date & Time <span className="text-dnews-red">*</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
              />
              <p className="mt-1 text-xs text-dnews-muted">
                The article will be automatically published at this date and time.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card overflow-hidden">
          <button type="button" onClick={() => setShowSeo(!showSeo)} className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-dnews-light-gray">
            <div className="flex items-center gap-2">
              <SearchIcon size={16} className="text-dnews-accent" />
              <h3 className="font-heading text-base font-semibold text-dnews-dark">SEO & Social Metadata</h3>
            </div>
            <span className={`text-xs text-dnews-muted transition-transform ${showSeo ? "rotate-180" : ""}`}>▼</span>
          </button>
          {showSeo && (
            <div className="border-t border-dnews-border p-6">
              <SeoMetadataForm
                metadata={seoMetadata}
                articleTitle={title}
                articleContent={content}
                articleSlug={slug}
                coverImageUrl={coverImageUrl}
                onSave={async (data) => {
                  setSeoSaving(true);
                  try {
                    await put(`/articles/${id}/seo`, data);
                    setSeoMetadata((prev) => ({ ...prev, ...data }));
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : "Failed to save SEO.");
                  } finally { setSeoSaving(false); }
                }}
                saving={seoSaving}
                readOnly={isJournalist}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/articles"
            className="rounded-sm border border-dnews-border px-5 py-2.5 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
          >
            Cancel
          </Link>
          {isJournalist && article?.status === "DRAFT" ? (
            <>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 rounded-sm border border-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-dnews-accent transition-colors hover:bg-dnews-accent/5 disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="button"
                onClick={handleSubmitForReview}
                disabled={submittingReview || submitting}
                className="flex items-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
              >
                <Send size={14} />
                {submittingReview ? "Submitting..." : "Submit for Review"}
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={submitting || !(!isJournalist || article?.status === "DRAFT")}
              className="flex items-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
