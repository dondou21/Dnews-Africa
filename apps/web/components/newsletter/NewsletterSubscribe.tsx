"use client";

import { useState, type FormEvent } from "react";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { post } from "@dnews/api-client";

interface NewsletterSubscribeProps {
  title?: string;
  description?: string;
  source?: string;
  buttonText?: string;
  className?: string;
}

export default function NewsletterSubscribe({
  title = "Stay informed with Dnews Africa.",
  description = "Get the latest African news, exclusive stories, investigations, business insights, sports, technology, culture, and weekly editor picks delivered directly to your inbox.",
  source = "HOME_PAGE",
  buttonText = "Subscribe",
  className = "",
}: NewsletterSubscribeProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsDuplicate(false);
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const body: Record<string, unknown> = { email: email.trim(), source };
      if (firstName.trim()) body.name = firstName.trim();
      if (honeypot) body._hp = honeypot;
      const result = await post<{ alreadySubscribed?: boolean; message?: string }>("/newsletter/subscribe", body);
      if (result?.alreadySubscribed) {
        setIsDuplicate(true);
        setError("You are already subscribed to the Dnews Africa newsletter.");
      } else {
        setSuccess(true);
      }
      setEmail("");
      setFirstName("");
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
        <div className="rounded-sm border border-green-500/30 bg-green-50 p-5 dark:bg-green-900/15">
          <div className="flex items-start gap-3">
            <CheckCircle
              size={22}
              className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                Welcome to Dnews Africa!
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-green-700 dark:text-green-400">
                Your subscription is now active. We&apos;ve sent a welcome
                email to your inbox with everything you need to get started.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-heading text-lg font-bold text-dnews-dark">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
            {description}
          </p>

          <form onSubmit={handleSubmit} className="mt-5" noValidate>
            <div className="space-y-3">
              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
                <label htmlFor="nl-website">Website</label>
                <input
                  id="nl-website"
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="nl-first-name" className="sr-only">
                  First Name (optional)
                </label>
                <input
                  id="nl-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name (optional)"
                  autoComplete="given-name"
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
                />
              </div>
              <div className="relative">
                <label htmlFor="nl-email" className="sr-only">
                  Email address
                </label>
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted"
                  aria-hidden="true"
                />
                <input
                  id="nl-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setIsDuplicate(false);
                  }}
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                  aria-describedby={error ? "nl-error" : undefined}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg py-2.5 pl-9 pr-3 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  buttonText
                )}
              </button>
            </div>
          </form>

          {error && (
            <div
              id="nl-error"
              role="alert"
              className={`mt-4 flex items-start gap-2 rounded-sm border px-4 py-3 ${
                isDuplicate
                  ? "border-amber-500/30 bg-amber-50 dark:bg-amber-900/15"
                  : "border-dnews-red/30 bg-dnews-red/5"
              }`}
            >
              {isDuplicate ? (
                <AlertCircle
                  size={15}
                  className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  size={15}
                  className="mt-0.5 shrink-0 text-dnews-red"
                  aria-hidden="true"
                />
              )}
              <p
                className={`text-xs leading-relaxed ${
                  isDuplicate
                    ? "text-amber-800 dark:text-amber-300"
                    : "text-dnews-red"
                }`}
              >
                {error}
              </p>
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-dnews-muted">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </>
      )}
    </div>
  );
}
