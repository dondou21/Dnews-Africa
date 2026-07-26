"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { FALLBACK_IMAGE } from "@/lib/image";

type ImageLayout = "card" | "hero" | "list";

interface ArticleImageProps {
  src: string;
  alt: string;
  layout?: ImageLayout;
  priority?: boolean;
  sizes?: string;
  className?: string;
  containerClassName?: string;
}

function getPositionClass(
  layout: ImageLayout,
  isPortrait: boolean | null
): string {
  if (layout === "hero") return "object-center";
  if (isPortrait === true) return "object-top";
  if (isPortrait === false) return "object-center";
  return "object-top";
}

export default function ArticleImage({
  src,
  alt,
  layout = "card",
  priority,
  sizes,
  className = "",
  containerClassName = "",
}: ArticleImageProps) {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setIsPortrait(img.naturalHeight > img.naturalWidth);
      }
    },
    []
  );

  const displaySrc = imgError ? FALLBACK_IMAGE : src;

  const aspectClass =
    layout === "list"
      ? "h-20 w-24"
      : "aspect-[16/9]";

  const positionClass = getPositionClass(layout, isPortrait);

  return (
    <div
      className={`relative ${aspectClass} w-full shrink-0 overflow-hidden rounded-sm bg-dnews-light-gray ${containerClassName}`}
    >
      <Image
        src={displaySrc}
        alt={alt}
        fill
        className={`object-cover ${positionClass} transition-transform duration-500 group-hover:scale-105 ${className}`}
        sizes={
          sizes ||
          (layout === "hero"
            ? "(max-width: 1024px) 100vw, 780px"
            : layout === "list"
            ? "96px"
            : "(max-width: 768px) 100vw, 50vw")
        }
        loading={priority ? undefined : "lazy"}
        priority={priority}
        onLoad={handleLoad}
        onError={() => setImgError(true)}
      />
    </div>
  );
}
