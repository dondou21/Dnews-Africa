"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "@/components/shared/AppImage";
import { ArrowLeft, Upload, Eye } from "lucide-react";
import { post, uploadFile } from "@/lib/api-client";
import { resolveImageUrl } from "@/lib/image";
import RoleGuard from "@/components/dashboard/RoleGuard";
import CampaignPreview from "@/components/newsletter/CampaignPreview";
import { useAuth } from "@/contexts/AuthContext";
import type { Campaign, CreateCampaignInput } from "@/types/campaign";

export default function NewCampaignPage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <NewCampaignForm />
    </RoleGuard>
  );
}

function NewCampaignForm() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role.name === "Admin";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "SCHEDULED">("DRAFT");

  const buildPreviewCampaign = (): Campaign | null => {
    if (!title && !subject) return null;
    return {
      id: "preview",
      title: title || "Untitled",
      subject: subject || "No subject",
      slug: "preview",
      content,
      plainText: null,
      excerpt: excerpt || null,
      featuredImage: featuredImage || null,
      status: "DRAFT",
      scheduledAt: null,
      sentAt: null,
      totalRecipients: 0,
      totalSent: 0,
      totalFailed: 0,
      totalOpened: 0,
      totalClicked: 0,
      templateId: null,
      template: null,
      createdById: user?.id || "",
      createdBy: { id: user?.id || "", firstName: user?.firstName || "", lastName: user?.lastName || "" },
      updatedById: null,
      updatedBy: null,
      _count: { recipients: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !subject) {
      setError("Title and subject are required.");
      if (errorRef.current) errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);

    try {
      const body: CreateCampaignInput = {
        title,
        subject,
        content,
        excerpt: excerpt || undefined,
        featuredImage: featuredImage || undefined,
        status: isAdmin ? status : "DRAFT",
      };
      await post("/newsletter/campaigns", body);
      router.push("/dashboard/newsletter/campaigns");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create campaign.";
      setError(msg);
      setSubmitting(false);
      if (errorRef.current) errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/newsletter/campaigns"
          className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-gray transition-colors hover:bg-dnews-light-gray"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">
            New Campaign
          </h2>
          <p className="text-sm text-dnews-muted">Create a new newsletter campaign.</p>
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
            Campaign Details
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
                placeholder="e.g. Weekly Roundup"
                required
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Subject Line <span className="text-dnews-red">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What subscribers see in their inbox"
                required
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Excerpt / Preview Text
              </label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short preview text shown after the subject"
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your newsletter content here (HTML supported)..."
                rows={14}
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted font-mono outline-none transition-colors focus:border-dnews-accent"
              />
              <p className="mt-1 text-xs text-dnews-muted">
                HTML content is supported. You can use basic HTML tags for styling.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">
            Featured Image
          </h3>

          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-2">
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const result = await uploadFile<{ url: string }>("/media/upload", file);
                    setFeaturedImage(result.url);
                  } catch {
                    setError("Failed to upload image.");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-sm border border-dnews-border px-3 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray disabled:opacity-50"
              >
                <Upload size={14} />
                {uploading ? "Uploading..." : "Upload from computer"}
              </button>
            </div>
            {featuredImage && (
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-sm border border-dnews-border">
                <Image
                  src={resolveImageUrl(featuredImage)}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
            <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">
              Publishing
            </h3>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={status === "DRAFT"}
                  onChange={() => setStatus("DRAFT")}
                  className="accent-dnews-accent"
                />
                <span className="text-sm text-dnews-dark">Save as Draft</span>
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              const preview = buildPreviewCampaign();
              if (preview) setPreviewOpen(true);
            }}
            className="flex items-center gap-2 rounded-sm border border-dnews-border px-5 py-2.5 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
          >
            <Eye size={14} />
            Preview
          </button>

          <Link
            href="/dashboard/newsletter/campaigns"
            className="rounded-sm border border-dnews-border px-5 py-2.5 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Create Campaign"}
          </button>
        </div>
      </form>

      <CampaignPreview
        campaign={previewOpen ? buildPreviewCampaign() : null}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
}
