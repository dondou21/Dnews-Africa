"use client";

import { useEffect, useState, useRef } from "react";
import {
  Upload,
  ExternalLink,
  Copy,
  Trash2,
  FileImage,
  File,
} from "lucide-react";
import Modal from "@/components/dashboard/Modal";
import EmptyState from "@/components/dashboard/EmptyState";
import LoadingState from "@/components/dashboard/LoadingState";
import { get, del, uploadFile, SERVER_BASE } from "@/lib/api-client";
import type { MediaItem } from "@/types/media";

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
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
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
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
    const fullUrl = `${SERVER_BASE}${url}`;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">
            Media Library
          </h2>
          <p className="mt-1 text-sm text-dnews-muted">
            {media.length} file{media.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleUpload}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className={`inline-flex cursor-pointer items-center gap-2 rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors ${
              uploading
                ? "bg-dnews-accent/60 cursor-not-allowed"
                : "bg-dnews-accent hover:bg-dnews-accent-light"
            }`}
          >
            <Upload size={16} className={uploading ? "animate-pulse" : ""} />
            {uploading ? "Uploading..." : "Upload"}
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">
            {success}
          </p>
        </div>
      )}

      {loading ? (
        <LoadingState variant="card" rows={4} />
      ) : media.length === 0 ? (
        <EmptyState
          title="No media yet"
          description="Upload images to use in your articles."
          icon={FileImage}
          action={
            <label
              htmlFor="media-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
            >
              <Upload size={16} />
              Upload Media
            </label>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-sm border border-dnews-border bg-dnews-card transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-dnews-light-gray">
                {isImage(item) ? (
                  <img
                    src={`${SERVER_BASE}${item.url}`}
                    alt={item.alt || ""}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <File size={40} className="text-dnews-muted" />
                  </div>
                )}
              </div>

              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-medium text-dnews-dark">
                  {getFileName(item.url)}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-dnews-muted">
                  <span className="rounded bg-dnews-light-gray px-1.5 py-0.5 font-medium text-dnews-gray uppercase">
                    {item.type}
                  </span>
                  <span>{formatSize(item.fileSize)}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>

                <p className="text-xs text-dnews-muted">
                  by {item.uploadedBy.firstName} {item.uploadedBy.lastName}
                </p>

                <div className="flex items-center gap-1 pt-1">
                  <button
                    onClick={() => handleCopyUrl(item.url)}
                    className="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded text-xs text-dnews-gray transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
                    title="Copy URL"
                  >
                    <Copy size={12} />
                    Copy URL
                  </button>
                  <a
                    href={`${SERVER_BASE}${item.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
                    title="Open in new tab"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Media"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-sm bg-dnews-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-red/80 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
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
