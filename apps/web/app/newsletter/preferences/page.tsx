"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, ExternalLink, Mail, Globe } from "lucide-react";
import { get, patch } from "@dnews/api-client";
import type { NewsletterSubscriber } from "@dnews/types";

const preferenceCategories = [
  { id: "daily", label: "Daily Newsletter" },
  { id: "weekly", label: "Weekly Digest" },
  { id: "breaking", label: "Breaking News" },
  { id: "politics", label: "Politics" },
  { id: "business", label: "Business" },
  { id: "technology", label: "Technology" },
  { id: "sports", label: "Sports" },
  { id: "entertainment", label: "Entertainment" },
  { id: "culture", label: "Culture" },
  { id: "travel", label: "Travel" },
  { id: "lifestyle", label: "Lifestyle" },
];

function PreferencesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscriber, setSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [error, setError] = useState("");
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!token) {
      setError("Missing token.");
      setLoading(false);
      return;
    }

    get<NewsletterSubscriber>(`/newsletter/preferences?token=${encodeURIComponent(token)}`)
      .then((sub) => {
        setSubscriber(sub);
        if (sub.preferences && typeof sub.preferences === "object") {
          setPreferences(sub.preferences as Record<string, boolean>);
        }
      })
      .catch(() => setError("Invalid or expired link. Please try again."))
      .finally(() => setLoading(false));
  }, [token]);

  const togglePreference = (id: string) => {
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      await patch("/newsletter/preferences", { token, preferences });
      setSaved(true);
    } catch {
      setError("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={48} className="animate-spin text-dnews-accent" />
      </div>
    );
  }

  if (error && !subscriber) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-dnews-red/10 p-4">
              <Globe size={40} className="text-dnews-red" />
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold text-dnews-dark">
            Unable to load preferences
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-dnews-gray">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dnews-accent-light"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-dnews-accent/10 p-4">
            <Mail size={32} className="text-dnews-accent" />
          </div>
        </div>
        <h1 className="font-heading text-2xl font-bold text-dnews-dark">
          Newsletter Preferences
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
          Manage what you receive from Dnews Africa.
          {subscriber && (
            <span className="block mt-1 text-xs text-dnews-muted">
              {subscriber.email}
            </span>
          )}
        </p>
      </div>

      {saved ? (
        <div className="rounded-sm border border-green-500/30 bg-green-50 p-6 text-center dark:bg-green-900/15">
          <CheckCircle size={32} className="mx-auto text-green-500" />
          <h2 className="mt-3 font-heading text-lg font-bold text-green-800 dark:text-green-300">
            Preferences saved!
          </h2>
          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
            Your newsletter preferences have been updated successfully.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 inline-flex items-center gap-2 rounded-sm bg-green-600 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-green-700"
          >
            <ExternalLink size={14} />
            Continue to Dnews Africa
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-sm border border-dnews-border bg-dnews-card">
            <div className="border-b border-dnews-border px-5 py-4">
              <h2 className="text-sm font-semibold text-dnews-dark">
                Email Categories
              </h2>
              <p className="mt-1 text-xs text-dnews-muted">
                Select the types of content you want to receive.
              </p>
            </div>
            <div className="divide-y divide-dnews-border">
              {preferenceCategories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex cursor-pointer items-center justify-between px-5 py-3.5 transition-colors hover:bg-dnews-light-gray/50"
                >
                  <span className="text-sm font-medium text-dnews-dark">
                    {cat.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={preferences[cat.id] ?? true}
                    onChange={() => togglePreference(cat.id)}
                    className="h-4 w-4 rounded border-dnews-border text-dnews-accent outline-none focus:ring-1 focus:ring-dnews-accent"
                  />
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
              <p className="text-xs font-medium text-dnews-red">{error}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button
              onClick={() => router.push("/")}
              className="rounded-sm border border-dnews-border px-5 py-2.5 text-sm font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-sm bg-dnews-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={48} className="animate-spin text-dnews-accent" />
      </div>
    }>
      <PreferencesContent />
    </Suspense>
  );
}
