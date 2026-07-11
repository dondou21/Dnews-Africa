"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { get } from "@/lib/api-client";
import type { NewsletterSubscriber } from "@/types/newsletter";

type VerifyState = "loading" | "success" | "expired" | "invalid" | "already_verified" | "error";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<VerifyState>("loading");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }

    get<NewsletterSubscriber>(`/newsletter/verify?token=${encodeURIComponent(token)}`)
      .then((sub) => {
        if (sub.verified && sub.status === "ACTIVE") {
          setState("success");
        } else {
          setState("already_verified");
        }
      })
      .catch((err: Error) => {
        const msg = err.message.toLowerCase();
        if (msg.includes("expired")) {
          setState("expired");
        } else if (msg.includes("already verified")) {
          setState("already_verified");
        } else {
          setState("invalid");
        }
      });
  }, [token]);

  const renderIcon = () => {
    switch (state) {
      case "loading":
        return <Loader2 size={48} className="animate-spin text-dnews-accent" />;
      case "success":
        return <CheckCircle size={48} className="text-green-500" />;
      case "already_verified":
        return <CheckCircle size={48} className="text-dnews-accent" />;
      case "expired":
        return <Clock size={48} className="text-amber-500" />;
      default:
        return <XCircle size={48} className="text-dnews-red" />;
    }
  };

  const renderContent = () => {
    switch (state) {
      case "loading":
        return {
          title: "Verifying your subscription...",
          description: "Please wait while we confirm your email.",
        };
      case "success":
        return {
          title: "Subscription confirmed!",
          description: "You're now subscribed to Dnews Africa. You'll start receiving the latest African stories in your inbox.",
        };
      case "already_verified":
        return {
          title: "Already verified",
          description: "This email has already been verified and is active on our list.",
        };
      case "expired":
        return {
          title: "Link expired",
          description: "This verification link has expired. Please subscribe again to receive a new verification email.",
        };
      case "invalid":
        return {
          title: "Invalid link",
          description: "This verification link is invalid or malformed. Please check the link or subscribe again.",
        };
      default:
        return {
          title: "Verification failed",
          description: "Something went wrong. Please try subscribing again.",
        };
    }
  };

  const { title, description } = renderContent();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">{renderIcon()}</div>

        <h1 className="font-heading text-2xl font-bold text-dnews-dark">
          {title}
        </h1>
        <p className="mt-3 text-sm text-dnews-muted">
          {description}
        </p>

        {(state === "expired" || state === "invalid" || state === "error") && (
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
          >
            Back to Home
          </Link>
        )}

        {state === "success" && (
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
          >
            Explore Dnews Africa
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 size={48} className="animate-spin text-dnews-accent" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
