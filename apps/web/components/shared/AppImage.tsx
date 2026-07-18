"use client";

import Image from "next/image";
import type { ImageProps } from "next/image";

const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "http://localhost:4000/uploads";

const isDev = process.env.NODE_ENV === "development";

function isBackendUpload(src: string): boolean {
  return src.startsWith(MEDIA_BASE_URL) || src.startsWith("http://localhost:");
}

export default function AppImage({ unoptimized, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";

  const needsUnoptimized =
    unoptimized || (isDev && src !== "" && isBackendUpload(src));

  return <Image {...props} unoptimized={needsUnoptimized} />;
}
