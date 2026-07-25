"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { post } from "@dnews/api-client";

type UnsubscribeState = "loading" | "confirm" | "success" | "error";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [state, setState] = useState<UnsubscribeState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMsg("Missing unsubscribe token.");
      return;
    }
    setState("confirm");
  }, [token]);

  const handleUnsubscribe = async () => {
    setState("loading");
    try {
      await post("/newsletter/unsubscribe", { token });
      setState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unsubscribe failed.";
      if (msg.toLowerCase().includes("already unsubscribed")) {
        setState("success");
      } else {
        setState("error");
        setErrorMsg(msg);
      }
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {state === "loading" && (
          <Loader2 size={48} className="mx-auto animate-spin text-dnews-accent" />
        )}

        {state === "confirm" && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-dnews-red/10 p-4">
                <XCircle size={40} className="text-dnews-red" />
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-dnews-dark">
              Unsubscribe from Newsletter
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-dnews-gray">
              Are you sure you want to unsubscribe from Dnews Africa? You will
              stop receiving all newsletter emails, including breaking news,
              weekly highlights, and exclusive content.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleUnsubscribe}
                className="rounded-sm bg-dnews-red px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dnews-red/80"
              >
                Yes, Unsubscribe
              </button>
              <button
                onClick={() => router.push("/")}
                className="rounded-sm border border-dnews-border px-6 py-2.5 text-sm font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
              >
                Keep my subscription
              </button>
            </div>
          </>
        )}

        {state === "success" && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-50 p-4">
                <CheckCircle size={40} className="text-green-500" />
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-dnews-dark">
              You&apos;ve been unsubscribed
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-dnews-gray">
              You have been successfully unsubscribed from Dnews Africa. You
              will no longer receive emails from us.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
              If you change your mind, you can resubscribe at any time.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dnews-accent-light"
              >
                <ExternalLink size={16} />
                Continue to Dnews Africa
              </button>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-dnews-red/10 p-4">
                <XCircle size={40} className="text-dnews-red" />
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-dnews-dark">
              Unable to unsubscribe
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-dnews-gray">
              {errorMsg || "Something went wrong. Please try again or contact us."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dnews-accent-light"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 size={48} className="animate-spin text-dnews-accent" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
