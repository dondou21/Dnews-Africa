"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { get, post } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import RoleGuard from "@/components/dashboard/RoleGuard";
import CoverImageUpload from "@/components/dashboard/CoverImageUpload";
import CategorySelect from "@/components/dashboard/CategorySelect";
import PublishingPanel from "@/components/dashboard/PublishingPanel";
import ArticleBlockEditor from "@/components/dashboard/BlockEditor";
import AuthorSelector from "@/components/dashboard/AuthorSelector";
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
  const [status, setStatus] = useState("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [authorType, setAuthorType] = useState<"user" | "manual">("user");
  const [authorUserId, setAuthorUserId] = useState(user?.id ?? "");
  const [authorName, setAuthorName] = useState("");
  const [authorPosition, setAuthorPosition] = useState("");
  const [authorOrganization, setAuthorOrganization] = useState("");

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
      const body: Record<string, unknown> = {
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
        isBreaking,
        allowComments,
        tags,
        scheduledAt: scheduleEnabled && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      };
      if (authorType === "user") {
        body.authorUserId = authorUserId;
      } else {
        body.authorName = authorName || null;
        body.authorPosition = authorPosition || null;
        body.authorOrganization = authorOrganization || null;
      }
      await post("/articles", body);
      router.push(`/dashboard/articles`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create article.";
      setError(msg);
      setSubmitting(false);
    }
  };

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
            />

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
            >
              {submitting ? "Saving..." : isJournalist ? "Save as Draft" : "Create Article"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
