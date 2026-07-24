"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Lock, SearchIcon } from "lucide-react";
import { get, patch, post, put } from "@dnews/api-client";
import { useAuth } from "@/contexts/AuthContext";
import RoleGuard from "@/components/dashboard/RoleGuard";
import LoadingState from "@/components/dashboard/LoadingState";
import FeaturedImageEditor from "@/components/dashboard/FeaturedImageEditor";
import CategorySelect from "@/components/dashboard/CategorySelect";
import PublishingPanel from "@/components/dashboard/PublishingPanel";
import ArticleBlockEditor from "@/components/dashboard/BlockEditor";
import AuthorSelector from "@/components/dashboard/AuthorSelector";
import SeoMetadataForm from "@/components/seo/SeoMetadataForm";
import type { Article, Category } from "@dnews/types";
import type { SeoMetadata } from "@dnews/types";

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
  const [featuredImageCaption, setFeaturedImageCaption] = useState("");
  const [featuredImageCredit, setFeaturedImageCredit] = useState("");
  const [featuredImageSource, setFeaturedImageSource] = useState("");
  const [featuredImageDescription, setFeaturedImageDescription] = useState("");
  const [featuredImageCopyright, setFeaturedImageCopyright] = useState("");
  const [featuredImageLocation, setFeaturedImageLocation] = useState("");
  const [featuredImageDateTaken, setFeaturedImageDateTaken] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<string>("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [authorType, setAuthorType] = useState<"user" | "manual">("user");
  const [authorUserId, setAuthorUserId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorPosition, setAuthorPosition] = useState("");
  const [authorOrganization, setAuthorOrganization] = useState("");
  const [seoMetadata, setSeoMetadata] = useState<Partial<SeoMetadata>>({});
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoSaving, setSeoSaving] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  const canEdit = !isJournalist || !article || article.status === "DRAFT" || article.status === "IDEA" || article.status === "NEEDS_REVISION";
  const articleStatus = article?.status;

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
        if (articleData.featuredImage) {
          setFeaturedImageCaption(articleData.featuredImage.caption ?? "");
          setFeaturedImageCredit(articleData.featuredImage.credit ?? "");
          setFeaturedImageSource(articleData.featuredImage.source ?? "");
          setFeaturedImageDescription(articleData.featuredImage.description ?? "");
          setFeaturedImageCopyright(articleData.featuredImage.copyright ?? "");
          setFeaturedImageLocation(articleData.featuredImage.location ?? "");
          setFeaturedImageDateTaken(articleData.featuredImage.dateTaken ?? "");
        }
        setCategoryId(articleData.categoryId);
        setStatus(articleData.status);
        setIsFeatured(articleData.isFeatured);
        setIsBreaking(articleData.isBreaking ?? false);
        setAllowComments(articleData.allowComments ?? true);
        setAuthorUserId(articleData.authorId);
        if (articleData.authorName) {
          setAuthorType("manual");
          setAuthorName(articleData.authorName);
          setAuthorPosition(articleData.authorPosition ?? "");
          setAuthorOrganization(articleData.authorOrganization ?? "");
        }
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
      const body: Record<string, unknown> = {
        title,
        slug,
        summary,
        content,
        coverImageUrl: coverImageUrl || undefined,
        coverImageAlt: coverImageAlt || undefined,
        featuredImageId: featuredImageId || undefined,
        featuredImageCaption: featuredImageCaption || undefined,
        featuredImageCredit: featuredImageCredit || undefined,
        featuredImageSource: featuredImageSource || undefined,
        featuredImageDescription: featuredImageDescription || undefined,
        featuredImageCopyright: featuredImageCopyright || undefined,
        featuredImageLocation: featuredImageLocation || undefined,
        featuredImageDateTaken: featuredImageDateTaken || undefined,
        categoryId: Number(categoryId),
        status: finalStatus,
        isFeatured,
        isBreaking,
        allowComments,
        tags,
        scheduledAt: scheduleEnabled && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      };
      if (authorType === "user") {
        body.authorUserId = authorUserId;
        body.authorName = null;
        body.authorPosition = null;
        body.authorOrganization = null;
      } else {
        body.authorName = authorName || null;
        body.authorPosition = authorPosition || null;
        body.authorOrganization = authorOrganization || null;
      }
      await patch(`/articles/${id}`, body);
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
    <div className="mx-auto max-w-6xl space-y-6">
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

      {!canEdit && (
        <div className="rounded-sm border border-dnews-accent/30 bg-dnews-accent/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-dnews-accent" />
            <p className="text-xs font-medium text-dnews-accent">
              This article is in {article?.status.replace(/_/g, " ").toLowerCase()} status and is locked for editing.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
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
                    disabled={!canEdit}
                    className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent disabled:opacity-50"
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
                    disabled={!canEdit}
                    className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark font-mono outline-none transition-colors focus:border-dnews-accent disabled:opacity-50"
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
                    disabled={!canEdit}
                    className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent disabled:opacity-50"
                  />
                </div>

                <div>
                  <ArticleBlockEditor content={content} onChange={setContent} />
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
                  <FeaturedImageEditor
                    initialUrl={coverImageUrl}
                    initialAlt={coverImageAlt}
                    initialCaption={featuredImageCaption}
                    initialCredit={featuredImageCredit}
                    initialSource={featuredImageSource}
                    initialDescription={featuredImageDescription}
                    initialCopyright={featuredImageCopyright}
                    initialLocation={featuredImageLocation}
                    initialDateTaken={featuredImageDateTaken}
                    onChange={(data) => {
                      setCoverImageUrl(data.url);
                      setCoverImageAlt(data.alt);
                      if (data.mediaId) setFeaturedImageId(data.mediaId);
                      setFeaturedImageCaption(data.caption ?? "");
                      setFeaturedImageCredit(data.credit ?? "");
                      setFeaturedImageSource(data.source ?? "");
                      setFeaturedImageDescription(data.description ?? "");
                      setFeaturedImageCopyright(data.copyright ?? "");
                      setFeaturedImageLocation(data.location ?? "");
                      setFeaturedImageDateTaken(data.dateTaken ?? "");
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
              <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">
                Organization
              </h3>

              {canEdit && (
                <div className="mb-4">
                  <AuthorSelector
                    value={{
                      type: authorType,
                      userId: authorUserId,
                      authorName,
                      authorPosition,
                      authorOrganization,
                    }}
                    onChange={(val) => {
                      setAuthorType(val.type);
                      if (val.type === "user") {
                        setAuthorUserId(val.userId ?? user?.id ?? "");
                        setAuthorName("");
                        setAuthorPosition("");
                        setAuthorOrganization("");
                      } else {
                        setAuthorName(val.authorName ?? "");
                        setAuthorPosition(val.authorPosition ?? "");
                        setAuthorOrganization(val.authorOrganization ?? "");
                      }
                    }}
                  />
                </div>
              )}

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
                    disabled={!canEdit}
                    className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent disabled:opacity-50"
                  />
                  <p className="mt-1 text-xs text-dnews-muted">
                    Comma-separated tags. Tags will be created automatically.
                  </p>
                </div>
              </div>
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
          </div>

          <div className="space-y-4">
            <PublishingPanel
              status={status}
              onStatusChange={setStatus}
              scheduleEnabled={scheduleEnabled}
              onScheduleToggle={setScheduleEnabled}
              scheduledAt={scheduledAt}
              onScheduledAtChange={setScheduledAt}
              isFeatured={isFeatured}
              onFeaturedChange={setIsFeatured}
              isBreaking={isBreaking}
              onBreakingChange={setIsBreaking}
              allowComments={allowComments}
              onAllowCommentsChange={setAllowComments}
              isJournalist={isJournalist}
              articleStatus={articleStatus}
            />

            {isJournalist && article?.status === "DRAFT" && (
              <button
                type="button"
                onClick={handleSubmitForReview}
                disabled={submittingReview || submitting}
                className="flex w-full items-center justify-center gap-2 rounded-sm border border-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-dnews-accent transition-colors hover:bg-dnews-accent/5 disabled:opacity-60"
              >
                <Send size={14} />
                {submittingReview ? "Submitting..." : "Submit for Review"}
              </button>
            )}

            <button
              type="submit"
              disabled={submitting || !canEdit}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
