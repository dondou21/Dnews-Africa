"use client";

import { useState } from "react";
import { FALLBACK_IMAGE } from "@/lib/image";

interface MediaImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function MediaImage({ src, alt, className }: MediaImageProps) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      key={src}
      src={failed ? FALLBACK_IMAGE : src}
      alt={alt || ""}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
