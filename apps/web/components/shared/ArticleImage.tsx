"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { FALLBACK_IMAGE } from "@/lib/image";

type ImageLayout = "card" | "hero" | "list";
type AspectRatio = "16/9" | "4/3" | "3/2" | "1/1" | "auto";
type ObjectFit = "cover" | "contain";

interface FocalPoint {
  x: number;
  y: number;
}

interface ArticleImageProps {
  src: string;
  alt: string;
  layout?: ImageLayout;
  aspectRatio?: AspectRatio;
  objectFit?: ObjectFit;
  focalPoint?: FocalPoint;
  priority?: boolean;
  sizes?: string;
  className?: string;
  containerClassName?: string;
}

const aspectRatioClasses: Record<AspectRatio, string> = {
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-square",
  "auto": "",
};

function getPositionClass(
  layout: ImageLayout,
  isPortrait: boolean | null,
  focalPoint?: FocalPoint
): string {
  if (focalPoint) {
    return `object-[position:${focalPoint.x}%_${focalPoint.y}%]`;
  }
  if (layout === "hero") return "object-center";
  if (isPortrait === true) return "object-top";
  if (isPortrait === false) return "object-center";
  return "object-top";
}

function getAspectRatio(layout: ImageLayout, aspectRatio?: AspectRatio): string {
  if (aspectRatio) return aspectRatioClasses[aspectRatio];
  if (layout === "list") return "";
  if (layout === "hero") return "aspect-[16/9]";
  return "aspect-[16/9]";
}

export default function ArticleImage({
  src,
  alt,
  layout = "card",
  aspectRatio,
  objectFit: fit = "cover",
  focalPoint,
  priority,
  sizes,
  className = "",
  containerClassName = "",
}: ArticleImageProps) {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setIsPortrait(img.naturalHeight > img.naturalWidth);
        setNaturalRatio(img.naturalWidth / img.naturalHeight);
      }
    },
    []
  );

  const displaySrc = imgError ? FALLBACK_IMAGE : src;

  const resolvedRatio = aspectRatio === "auto" && naturalRatio
    ? `aspect-[${naturalRatio.toFixed(2)}]`
    : null;

  const aspectClass = layout === "list"
    ? "h-20 w-24"
    : resolvedRatio ?? getAspectRatio(layout, aspectRatio);

  const positionClass = getPositionClass(layout, isPortrait, focalPoint);

  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  return (
    <div
      className={`relative ${aspectClass} w-full shrink-0 overflow-hidden rounded-sm bg-dnews-light-gray ${containerClassName}`}
    >
      <Image
        src={displaySrc}
        alt={alt}
        fill
        className={`${fitClass} ${positionClass} transition-transform duration-500 group-hover:scale-105 ${className}`}
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
