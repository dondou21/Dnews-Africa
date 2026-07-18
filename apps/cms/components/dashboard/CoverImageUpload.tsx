"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, X, AlertCircle, Check, ImageIcon } from "lucide-react";
import { uploadFile } from "@dnews/api-client";
import { resolveImageUrl } from "@/lib/image";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface CoverImageUploadProps {
  initialUrl?: string;
  initialAlt?: string;
  onImageChange: (url: string, alt: string, mediaId?: string) => void;
}

export default function CoverImageUpload({ initialUrl, initialAlt, onImageChange }: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialUrl ?? "");
  const [mediaId, setMediaId] = useState<string>("");
  const [alt, setAlt] = useState(initialAlt ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(async (file: File) => {
    setError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are accepted.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Image must be under 5 MB.");
      return;
    }

    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setFileName(file.name);
    setDimensions(null);

    const img = new Image();
    img.onload = () => setDimensions({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = objectUrl;

    setUploading(true);
    try {
      const result = await uploadFile<{ id: string; url: string; alt?: string }>("/media/upload", file);

      if (result.url) {
        setUploadedUrl(result.url);
        setMediaId(result.id);
        onImageChange(result.url, alt || result.alt || "", result.id);
      }
    } catch {
      setError("Upload failed. Please try again.");
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setPreview(null);
      setFileName("");
    } finally {
      setUploading(false);
    }
  }, [alt, onImageChange, preview]);

  const handleRemove = useCallback(() => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(null);
    setUploadedUrl("");
    setMediaId("");
    setFileName("");
    setDimensions(null);
    setError("");
    setAlt("");
    onImageChange("", "");
    if (inputRef.current) inputRef.current.value = "";
  }, [onImageChange, preview]);

  const handleReplaceClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

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
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-dnews-border bg-dnews-bg p-8 transition-colors hover:border-dnews-accent hover:bg-dnews-light-gray"
        >
          <ImageIcon size={32} className="text-dnews-muted" />
          <div className="text-center">
            <p className="text-sm font-medium text-dnews-dark">Choose Cover Image</p>
            <p className="mt-1 text-xs text-dnews-muted">JPG, PNG, or WebP up to 5 MB</p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-3 rounded-sm border border-dnews-border bg-dnews-bg p-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-dnews-accent border-t-transparent" />
          <p className="text-sm text-dnews-muted">
            Uploading{fileName ? ` ${fileName}` : ""}...
          </p>
        </div>
      )}

      {displaySrc && !uploading && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-sm border border-dnews-border bg-dnews-light-gray">
            <img
              src={displaySrc}
              alt={alt || "Cover preview"}
              className="max-h-[300px] w-full object-contain"
            />
            <div className="absolute right-2 top-2 flex gap-1">
              <button
                type="button"
                onClick={handleReplaceClick}
                className="inline-flex h-7 w-7 items-center justify-center rounded bg-black/60 text-white transition-colors hover:bg-black/80"
                title="Replace image"
              >
                <Upload size={14} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex h-7 w-7 items-center justify-center rounded bg-black/60 text-white transition-colors hover:bg-black/80"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-dnews-muted">
            {fileName && <span className="font-medium text-dnews-dark">{fileName}</span>}
            {dimensions && <span>{dimensions.w} &times; {dimensions.h}</span>}
            {uploadedUrl && (
              <span className="inline-flex items-center gap-1 text-green-600">
                <Check size={12} /> Uploaded
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-3 py-2">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-dnews-red" />
          <p className="text-xs text-dnews-red">{error}</p>
        </div>
      )}

      {displaySrc && !uploading && (
        <div className="mt-3">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
            Alt Text
          </label>
          <input
            type="text"
            value={alt}
            onChange={(e) => {
              setAlt(e.target.value);
              onImageChange(uploadedUrl, e.target.value, mediaId || undefined);
            }}
            placeholder="Describe the image for accessibility"
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
          />
        </div>
      )}
    </div>
  );
}
