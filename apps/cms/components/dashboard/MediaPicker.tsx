"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X, ImageIcon, Loader, AlertCircle } from "lucide-react";
import { get } from "@dnews/api-client";
import { resolveImageUrl } from "@/lib/image";
import Modal from "./Modal";
import MediaImage from "./MediaImage";
import type { MediaItem } from "@dnews/types";

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem) => void;
  title?: string;
}

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  title = "Media Library",
}: MediaPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get<MediaItem[]>("/media");
      setMedia(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load media library.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      load();
    }
  }, [open, load]);

  const images = media.filter((m) => m.type === "IMAGE");
  const filtered = query
    ? images.filter((m) => {
        const q = query.toLowerCase();
        const name = m.url.split("/").pop()?.toLowerCase() ?? "";
        return name.includes(q) || (m.alt ?? "").toLowerCase().includes(q);
      })
    : images;

  const handleSelect = (m: MediaItem) => {
    onSelect(m);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="2xl">
      <div className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search images..."
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-8 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-dnews-muted hover:text-dnews-dark"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-dnews-muted">
            <Loader size={18} className="animate-spin" /> Loading media...
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-3 py-3 text-xs text-dnews-red">
            <AlertCircle size={14} /> {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-dnews-muted">
            <ImageIcon size={28} />
            <p className="text-sm">
              {images.length === 0
                ? "No images in the media library yet."
                : "No matching images."}
            </p>
          </div>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelect(m)}
                className="group relative aspect-video overflow-hidden rounded-sm border border-dnews-border bg-dnews-light-gray transition-colors hover:border-dnews-accent"
                title={m.alt || m.url.split("/").pop()}
              >
                <MediaImage
                  src={resolveImageUrl(m.url)}
                  alt={m.alt || ""}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1.5 py-1 text-left text-[10px] text-white">
                  {m.alt || m.url.split("/").pop()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
