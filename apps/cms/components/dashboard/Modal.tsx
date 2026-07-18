"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidth =
    size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-lg" : "max-w-md";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidth} rounded-sm border border-dnews-border bg-dnews-card shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-dnews-border px-5 py-4">
          <h3 className="font-heading text-base font-semibold text-dnews-dark">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-dnews-border px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
