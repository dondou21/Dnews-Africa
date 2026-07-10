"use client";

import { useState, type FormEvent } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import { post } from "@/lib/api-client";

interface NewsletterSubscribeProps {
  title?: string;
  description?: string;
  source?: string;
  buttonText?: string;
  className?: string;
}

export default function NewsletterSubscribe({
  title = "Stay Informed",
  description = "Get the latest African news delivered to your inbox.",
  source = "HOME_PAGE",
  buttonText = "Subscribe",
  className = "",
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await post("/newsletter/subscribe", { email: email.trim(), source });
      setSuccess(true);
      setEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Subscription failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {success ? (
        <div className="flex items-start gap-3 rounded-sm bg-green-50 p-4 dark:bg-green-900/20">
          <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Check your inbox!
            </p>
            <p className="mt-1 text-xs text-green-700 dark:text-green-400">
              A verification email has been sent. Please confirm your subscription.
            </p>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-heading text-base font-semibold text-dnews-dark">
            {title}
          </h3>
          <p className="mt-1 text-sm text-dnews-muted">
            {description}
          </p>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg py-2.5 pl-9 pr-3 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="shrink-0 rounded-sm bg-dnews-accent px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
              >
                {loading ? "..." : buttonText}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-3 py-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-dnews-red" />
              <p className="text-xs text-dnews-red">{error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
