"use client";

import { resolveImageUrl } from "@/lib/image";

interface SocialPreviewProps {
  title?: string;
  description?: string;
  imageUrl?: string | null;
  url?: string;
}

export default function SocialPreview({ title, description, imageUrl, url }: SocialPreviewProps) {
  const displayTitle = title || "Dnews Africa";
  const displayDesc = description || "Latest African news, stories, and analysis.";
  const displayUrl = url ? new URL(url).hostname + (new URL(url).pathname.length > 40 ? new URL(url).pathname.slice(0, 40) + "..." : new URL(url).pathname) : "dnewsafrica.com";
  const initials = displayTitle.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-3 rounded-sm border border-dnews-border bg-dnews-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-dnews-gray">Social Preview</p>

      <div className="overflow-hidden rounded-sm border border-dnews-border">
        {imageUrl ? (
          <div className="aspect-[1.91/1] w-full bg-dnews-light-gray">
            <img src={resolveImageUrl(imageUrl)} alt="Preview" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-gradient-to-br from-dnews-accent to-blue-800">
            <span className="text-2xl font-bold text-white/80">{initials}</span>
          </div>
        )}
        <div className="p-3">
          <p className="text-xs uppercase text-gray-500">{displayUrl}</p>
          <p className="mt-0.5 text-sm font-semibold leading-tight text-gray-900 line-clamp-2">{displayTitle}</p>
          <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{displayDesc}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-dnews-border bg-dnews-bg">
        <div className="flex items-center gap-2 border-b border-dnews-border px-3 py-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
            <span className="text-[10px] font-bold text-white">T</span>
          </div>
          <span className="text-xs font-medium text-dnews-dark">Twitter/X</span>
        </div>
        <div className="p-3">
          {imageUrl && (
            <div className="mb-2 aspect-[2/1] w-full overflow-hidden rounded-sm">
              <img src={resolveImageUrl(imageUrl)} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <p className="text-sm font-medium text-dnews-dark">{displayTitle}</p>
          <p className="mt-0.5 text-xs text-dnews-muted line-clamp-2">{displayDesc}</p>
          <p className="mt-1 text-xs text-dnews-muted">{displayUrl}</p>
        </div>
      </div>
    </div>
  );
}
