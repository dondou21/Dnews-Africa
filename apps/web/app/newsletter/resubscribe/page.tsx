"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { post } from "@dnews/api-client";

type ResubscribeState = "loading" | "success" | "already_active" | "error";

function ResubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [state, setState] = useState<ResubscribeState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMsg("Missing token.");
      return;
    }

    post("/newsletter/resubscribe", { token })
      .then(() => setState("success"))
      .catch((err: Error) => {
        const msg = err.message.toLowerCase();
        if (msg.includes("already active")) {
          setState("already_active");
        } else {
          setState("error");
          setErrorMsg(err.message);
        }
      });
  }, [token]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {state === "loading" && (
          <Loader2 size={48} className="mx-auto animate-spin text-dnews-accent" />
        )}

        {state === "success" && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-50 p-4">
                <CheckCircle size={40} className="text-green-500" />
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-dnews-dark">
              Welcome back!
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-dnews-gray">
              You&apos;ve been resubscribed to Dnews Africa. Please check your
              inbox for a confirmation email to verify your subscription.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-8 inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dnews-accent-light"
            >
              <ExternalLink size={16} />
              Continue to Dnews Africa
            </button>
          </>
        )}

        {state === "already_active" && (
          <>
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-blue-50 p-4">
                <CheckCircle size={40} className="text-dnews-accent" />
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-dnews-dark">
              Already subscribed
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-dnews-gray">
              This email is already an active subscriber. You&apos;re all set!
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-8 inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dnews-accent-light"
            >
              <ExternalLink size={16} />
              Continue to Dnews Africa
            </button>
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
              Unable to resubscribe
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-dnews-gray">
              {errorMsg || "Invalid or expired token. Please subscribe again."}
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

export default function ResubscribePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 size={48} className="animate-spin text-dnews-accent" />
      </div>
    }>
      <ResubscribeContent />
    </Suspense>
  );
}
