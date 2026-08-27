"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, AlertCircle, Check, ImageIcon, Loader, Library } from "lucide-react";
import { uploadFile } from "@dnews/api-client";
import { resolveImageUrl } from "@/lib/image";
import MediaPicker from "./MediaPicker";

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface InlineImageValue {
  url: string;
  mediaId?: string;
  alt?: string;
}

interface InlineImageUploadProps {
  initialUrl?: string;
  initialAlt?: string;
  initialMediaId?: string;
  onComplete?: (value: InlineImageValue) => void;
  onClear?: () => void;
}

export default function InlineImageUpload({
  initialUrl,
  initialAlt,
  initialMediaId,
  onComplete,
  onClear,
}: InlineImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialUrl ?? "");
  const [mediaId, setMediaId] = useState<string>(initialMediaId ?? "");
  const [alt, setAlt] = useState<string>(initialAlt ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const emit = useCallback(
    (next: { url: string; mediaId?: string; alt?: string }) => {
      onComplete?.(next);
    },
    [onComplete]
  );

  const handleFile = useCallback(
    async (file: File) => {
      setError("");

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPG, PNG, and WebP images are accepted.");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("Image must be under 10 MB.");
        return;
      }

      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setUploading(true);

      try {
        const result = await uploadFile<{ id: string; url: string }>("/media/upload", file);
        if (result.url) {
          setUploadedUrl(result.url);
          const newMediaId = result.id;
          setMediaId(newMediaId);
          emit({ url: result.url, mediaId: newMediaId, alt });
        }
      } catch {
        setError("Upload failed. Please try again.");
        if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [alt, emit, preview]
  );

  const handleLibrarySelect = useCallback(
    (media: { id: string; url: string; alt?: string | null }) => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setPreview(null);
      const newUrl = media.url;
      const newMediaId = media.id;
      setUploadedUrl(newUrl);
      setMediaId(newMediaId);
      const newAlt = alt || media.alt || "";
      setAlt(newAlt);
      emit({ url: newUrl, mediaId: newMediaId, alt: newAlt });
    },
    [alt, emit, preview]
  );

  const handleRemove = useCallback(() => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setUploadedUrl("");
    setMediaId("");
    setAlt("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }, [onClear, preview]);

  const handleAltChange = (value: string) => {
    setAlt(value);
    emit({ url: uploadedUrl, mediaId: mediaId || undefined, alt: value });
  };

  const displaySrc = preview?.startsWith("blob:")
    ? preview
    : uploadedUrl
      ? resolveImageUrl(uploadedUrl)
      : null;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {!displaySrc && !uploading && (
        <div className="space-y-2">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border-2 border-dashed p-6 transition-colors ${
              dragOver
                ? "border-dnews-accent bg-dnews-accent/5"
                : "border-dnews-border bg-dnews-bg hover:border-dnews-accent hover:bg-dnews-light-gray"
            }`}
          >
            <ImageIcon size={24} className="text-dnews-muted" />
            <div className="text-center">
              <p className="text-xs font-medium text-dnews-dark">Upload from Device</p>
              <p className="mt-0.5 text-[10px] text-dnews-muted">Drag & drop or click to browse</p>
              <p className="mt-0.5 text-[10px] text-dnews-muted">JPG, PNG, WebP up to 10 MB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-dnews-border bg-dnews-bg py-2 text-xs font-medium text-dnews-gray transition-colors hover:border-dnews-accent hover:text-dnews-accent"
          >
            <Library size={14} /> Choose from Media Library
          </button>
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2 rounded-sm border border-dnews-border bg-dnews-bg py-6">
          <Loader size={16} className="animate-spin text-dnews-accent" />
          <span className="text-xs text-dnews-muted">Uploading image...</span>
        </div>
      )}

      {displaySrc && !uploading && (
        <div className="space-y-2">
          <div className="relative overflow-hidden rounded-sm border border-dnews-border bg-dnews-light-gray">
            <img
              src={displaySrc}
              alt="Uploaded preview"
              className="max-h-[200px] w-full object-contain"
            />
            <div className="absolute right-2 top-2 flex gap-1">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-6 w-6 items-center justify-center rounded bg-black/60 text-white transition-colors hover:bg-black/80"
                title="Replace image"
              >
                <Upload size={12} />
              </button>
              <button
                type="button"
                onClick={() => setShowLibrary(true)}
                className="inline-flex h-6 w-6 items-center justify-center rounded bg-black/60 text-white transition-colors hover:bg-black/80"
                title="Choose from library"
              >
                <Library size={12} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex h-6 w-6 items-center justify-center rounded bg-black/60 text-white transition-colors hover:bg-black/80"
                title="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-dnews-gray">
              Alt Text
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => handleAltChange(e.target.value)}
              placeholder="Describe the image for accessibility"
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
            />
          </div>
          {uploadedUrl && (
            <p className="inline-flex items-center gap-1 text-[10px] text-green-600">
              <Check size={10} />
              {mediaId ? "Linked to media library" : "Uploaded"}
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-1 flex items-start gap-1.5 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-2 py-1.5">
          <AlertCircle size={12} className="mt-0.5 shrink-0 text-dnews-red" />
          <p className="text-[11px] text-dnews-red">{error}</p>
        </div>
      )}

      <MediaPicker
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={handleLibrarySelect}
      />
    </div>
  );
}
