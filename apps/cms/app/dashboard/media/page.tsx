"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  Upload,
  ExternalLink,
  Copy,
  Trash2,
  FileImage,
  File,
  ImageIcon,
  Search,
  X,
  Grid3X3,
  List,
  Calendar,
  HardDrive,
  User,
  Tag,
  ArrowUpDown,
} from "lucide-react";
import Modal from "@/components/dashboard/Modal";
import EmptyState from "@/components/dashboard/EmptyState";
import LoadingState from "@/components/dashboard/LoadingState";
import PageHeader from "@/components/ui/PageHeader";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { get, del, uploadFile } from "@dnews/api-client";
import { resolveImageUrl } from "@/lib/image";
import RoleGuard from "@/components/dashboard/RoleGuard";
import type { MediaItem } from "@dnews/types";

type ViewMode = "grid" | "list";
type SortKey = "createdAt" | "fileSize" | "type" | "filename";

function formatSize(bytes: number | null): string {
  if (!bytes) return "\u2014";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getFileName(url: string): string {
  const parts = url.split("/");
  return parts[parts.length - 1];
}

export default function MediaPage() {
  return (
    <RoleGuard roles={["Admin", "Editor", "Journalist"]}>
      <MediaPageContent />
    </RoleGuard>
  );
}

function MediaPageContent() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTarget, setPreviewTarget] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get<MediaItem[]>("/media");
      setMedia(data);
    } catch {
      setError("Failed to load media.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const filteredMedia = useMemo(() => {
    let items = media;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (m) =>
          getFileName(m.url).toLowerCase().includes(q) ||
          m.alt?.toLowerCase().includes(q) ||
          m.type.toLowerCase().includes(q) ||
          m.uploadedBy.firstName.toLowerCase().includes(q) ||
          m.uploadedBy.lastName.toLowerCase().includes(q)
      );
    }
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "fileSize":
          return (b.fileSize || 0) - (a.fileSize || 0);
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return getFileName(a.url).localeCompare(getFileName(b.url));
      }
    });
  }, [media, searchQuery, sortBy]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError("");

    try {
      await uploadFile("/media/upload", file);
      setSuccess("File uploaded successfully.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMedia();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = resolveImageUrl(url);
    navigator.clipboard.writeText(fullUrl).then(() => {
      setSuccess("URL copied to clipboard.");
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/media/${deleteTarget.id}`);
      setSuccess("Media deleted successfully.");
      setDeleteTarget(null);
      fetchMedia();
    } catch {
      setError("Failed to delete media.");
    } finally {
      setDeleting(false);
    }
  };

  const isImage = (m: MediaItem) => m.type === "IMAGE";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description={`${media.length} file${media.length !== 1 ? "s" : ""} uploaded`}
        action={
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleUpload}
              className="hidden"
              id="media-upload"
            />
            <Button
              variant="primary"
              loading={uploading}
              icon={<Upload size={16} className={uploading ? "animate-pulse" : ""} />}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        }
      />

      {error && <Alert variant="error" message={error} onDismiss={() => setError("")} />}
      {success && <Alert variant="success" message={success} onDismiss={() => setSuccess("")} />}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="w-full rounded-lg border border-dnews-border bg-dnews-bg py-2 pl-9 pr-8 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent focus:ring-2 focus:ring-dnews-accent/10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-dnews-muted hover:text-dnews-dark"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-lg border border-dnews-border bg-dnews-bg px-3 py-2 text-xs font-medium text-dnews-gray outline-none transition-colors focus:border-dnews-accent"
        >
          <option value="createdAt">Newest First</option>
          <option value="filename">Name A-Z</option>
          <option value="fileSize">Size</option>
          <option value="type">Type</option>
        </select>

        <div className="flex items-center rounded-lg border border-dnews-border bg-dnews-bg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === "grid"
                ? "bg-dnews-accent text-white"
                : "text-dnews-gray hover:text-dnews-dark"
            }`}
            aria-label="Grid view"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === "list"
                ? "bg-dnews-accent text-white"
                : "text-dnews-gray hover:text-dnews-dark"
            }`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState variant="card" rows={6} />
      ) : filteredMedia.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching media" : "No media yet"}
          description={
            searchQuery
              ? "Try a different search term."
              : "Upload images to use in your articles."
          }
          icon={searchQuery ? Search : ImageIcon}
          action={
            !searchQuery ? (
              <Button
                icon={<Upload size={16} />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Media
              </Button>
            ) : undefined
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-xl border border-dnews-border bg-dnews-card transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() => setPreviewTarget(item)}
                className="relative aspect-video w-full overflow-hidden bg-dnews-light-gray"
              >
                {isImage(item) ? (
                  <img
                    src={resolveImageUrl(item.url)}
                    alt={item.alt || ""}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <File size={40} className="text-dnews-muted" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
              <div className="space-y-2 p-4">
                <p className="truncate text-sm font-medium text-dnews-dark">
                  {getFileName(item.url)}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-dnews-muted">
                  <span className="rounded-md bg-dnews-light-gray px-1.5 py-0.5 font-medium text-dnews-gray uppercase ring-1 ring-inset ring-dnews-border/50">
                    {item.type}
                  </span>
                  <span>{formatSize(item.fileSize)}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <p className="truncate text-xs text-dnews-muted">
                  by {item.uploadedBy.firstName} {item.uploadedBy.lastName}
                </p>
                <div className="flex items-center gap-1 pt-1.5">
                  <button
                    onClick={() => handleCopyUrl(item.url)}
                    className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-dnews-gray transition-all hover:bg-dnews-light-gray hover:text-dnews-accent"
                    title="Copy URL"
                  >
                    <Copy size={12} />
                    Copy
                  </button>
                  <button
                    onClick={() => setPreviewTarget(item)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
                    title="Preview"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-dnews-border bg-dnews-card">
          <div className="divide-y divide-dnews-border">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-dnews-light-gray/50"
              >
                <button
                  onClick={() => setPreviewTarget(item)}
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-dnews-light-gray"
                >
                  {isImage(item) ? (
                    <img
                      src={resolveImageUrl(item.url)}
                      alt={item.alt || ""}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <File size={20} className="text-dnews-muted" />
                    </div>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-dnews-dark">
                    {getFileName(item.url)}
                  </p>
                  <p className="text-xs text-dnews-muted">
                    {item.type} \u00B7 {formatSize(item.fileSize)} \u00B7 {formatDate(item.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopyUrl(item.url)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
                    title="Copy URL"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => setPreviewTarget(item)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
                    title="Preview"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        open={!!previewTarget}
        onClose={() => setPreviewTarget(null)}
        title="Media Preview"
        size="2xl"
        footer={
          previewTarget ? (
            <div className="flex items-center gap-2 w-full">
              <Button
                variant="outline"
                size="xs"
                icon={<Copy size={12} />}
                onClick={() => handleCopyUrl(previewTarget.url)}
              >
                Copy URL
              </Button>
              <a
                href={resolveImageUrl(previewTarget.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
              >
                <Button variant="outline" size="xs" icon={<ExternalLink size={12} />}>
                  Open Original
                </Button>
              </a>
            </div>
          ) : undefined
        }
      >
        {previewTarget && (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-xl bg-dnews-light-gray">
              {isImage(previewTarget) ? (
                <img
                  src={resolveImageUrl(previewTarget.url)}
                  alt={previewTarget.alt || ""}
                  className="mx-auto max-h-[60vh] w-full object-contain"
                />
              ) : (
                <div className="flex h-48 items-center justify-center">
                  <File size={64} className="text-dnews-muted" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-dnews-muted">Filename</p>
                  <p className="mt-0.5 font-medium text-dnews-dark break-all">{getFileName(previewTarget.url)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-dnews-muted">Type</p>
                  <p className="mt-0.5 text-dnews-dark">{previewTarget.type}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-dnews-muted">File Size</p>
                  <p className="mt-0.5 text-dnews-dark">{formatSize(previewTarget.fileSize)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-dnews-muted">Dimensions</p>
                  <p className="mt-0.5 text-dnews-dark">
                    {previewTarget.width && previewTarget.height
                      ? `${previewTarget.width} \u00D7 ${previewTarget.height}`
                      : "\u2014"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-dnews-muted">Alt Text</p>
                  <p className="mt-0.5 text-dnews-dark">{previewTarget.alt || "\u2014"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-dnews-muted">Uploaded By</p>
                  <p className="mt-0.5 text-dnews-dark">
                    {previewTarget.uploadedBy.firstName} {previewTarget.uploadedBy.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-dnews-muted">Upload Date</p>
                  <p className="mt-0.5 text-dnews-dark">{formatDate(previewTarget.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-dnews-muted">Extension</p>
                  <p className="mt-0.5 text-dnews-dark">{previewTarget.extension || "\u2014"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Media"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-dnews-gray">
          Are you sure you want to delete this file? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
