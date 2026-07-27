"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { FALLBACK_IMAGE } from "@/lib/image";

type ImageLayout = "card" | "hero" | "list";

interface FocalPoint {
  x: number;
  y: number;
}

interface ArticleImageProps {
  src: string;
  alt: string;
  layout?: ImageLayout;
  focalPoint?: FocalPoint;
  priority?: boolean;
  sizes?: string;
  className?: string;
  containerClassName?: string;
}

const LIST_CLASS = "h-20 w-24";

function getPositionClass(
  layout: ImageLayout,
  isPortrait: boolean | null,
  focalPoint?: FocalPoint
): string {
  if (focalPoint) return `object-[position:${focalPoint.x}%_${focalPoint.y}%]`;
  if (layout === "hero") return "object-center";
  if (isPortrait === true) return "object-top";
  return "object-center";
}

export default function ArticleImage({
  src,
  alt,
  layout = "card",
  focalPoint,
  priority,
  sizes,
  className = "",
  containerClassName = "",
}: ArticleImageProps) {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);
  const [imgError, setImgError] = useState(false);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setIsPortrait(img.naturalHeight > img.naturalWidth);
        setNaturalWidth(img.naturalWidth);
        setNaturalHeight(img.naturalHeight);
      }
    },
    []
  );

  const displaySrc = imgError ? FALLBACK_IMAGE : src;

  const positionClass = getPositionClass(layout, isPortrait, focalPoint);

  if (layout === "list") {
    return (
      <div
        className={`relative ${LIST_CLASS} shrink-0 overflow-hidden rounded-sm bg-dnews-light-gray ${containerClassName}`}
      >
        <Image
          src={displaySrc}
          alt={alt}
          fill
          className={`object-cover object-top transition-transform duration-300 hover:scale-110 ${className}`}
          sizes={sizes || "96px"}
          loading="lazy"
          onLoad={handleLoad}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  const hasNaturalDimensions = naturalWidth !== null && naturalHeight !== null;

  return (
    <div
      className={`relative w-full shrink-0 overflow-hidden rounded-sm bg-dnews-light-gray ${containerClassName}`}
      style={
        hasNaturalDimensions
          ? { aspectRatio: `${naturalWidth} / ${naturalHeight}` }
          : { aspectRatio: "16 / 9" }
      }
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
