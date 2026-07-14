"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import { get, post } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import RoleGuard from "@/components/dashboard/RoleGuard";
import CoverImageUpload from "@/components/dashboard/CoverImageUpload";
import CategorySelect from "@/components/dashboard/CategorySelect";
import type { Category } from "@/types/article";


export default function NewArticlePage() {
  return (
    <RoleGuard roles={["Admin", "Editor", "Journalist"]}>
      <NewArticleForm />
    </RoleGuard>
  );
}

function NewArticleForm() {
  const router = useRouter();
  const { user } = useAuth();
  const isJournalist = user?.role.name === "Journalist";
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "SCHEDULED">("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => {
    setCategoriesLoading(true);
    get<Category[]>("/categories")
      .then(setCategories)
      .catch(() => setError("Failed to load categories."))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(val));
    }
  };

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
      const finalStatus = scheduleEnabled ? "SCHEDULED" : status;
      await post("/articles", {
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
      router.push(`/dashboard/articles`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create article.";
      setError(msg);
      setSubmitting(false);
    }
  };

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
            New Article
          </h2>
          <p className="text-sm text-dnews-muted">Create a new article.</p>
        </div>
      </div>

      {error && (
        <div ref={errorRef} className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
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
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter article title"
                required
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
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
                placeholder="article-url-slug"
                required
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent font-mono"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Summary / Excerpt <span className="text-dnews-red">*</span>
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary of the article"
                required
                rows={3}
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Content <span className="text-dnews-red">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Article body content..."
                required
                rows={12}
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent font-mono"
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
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="DRAFT"
                    checked={status === "DRAFT" && !scheduleEnabled}
                    onChange={() => { setStatus("DRAFT"); setScheduleEnabled(false); }}
                    className="accent-dnews-accent"
                  />
                  <span className="text-sm text-dnews-dark">Draft</span>
                </label>
                {!isJournalist && (
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

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/dashboard/articles"
            className="rounded-sm border border-dnews-border px-5 py-2.5 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
          >
            {submitting ? "Saving..." : isJournalist ? "Save as Draft" : "Create Article"}
          </button>
        </div>
      </form>
    </div>
  );
}
