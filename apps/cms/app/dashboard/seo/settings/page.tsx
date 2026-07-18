"use client";

import { useEffect, useState, type FormEvent } from "react";
import { get, put } from "@dnews/api-client";
import RoleGuard from "@/components/dashboard/RoleGuard";
import LoadingState from "@/components/dashboard/LoadingState";
import type { SeoSettings } from "@dnews/types";

export default function SeoSettingsPage() {
  return (<RoleGuard roles={["Admin", "Editor"]}><SeoSettingsContent /></RoleGuard>);
}

function SeoSettingsContent() {
  const [settings, setSettings] = useState<SeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    siteTitle: "", defaultDescription: "", defaultImageUrl: "", defaultRobots: "index, follow",
    organizationName: "", organizationLogo: "",
    socialFacebook: "", socialTwitter: "", socialInstagram: "", socialLinkedin: "",
    googleNewsPubName: "", googleNewsPubLogo: "",
  });

  useEffect(() => {
    get<SeoSettings>("/seo/settings").then((data) => {
      setSettings(data);
      setForm({
        siteTitle: data.siteTitle, defaultDescription: data.defaultDescription,
        defaultImageUrl: data.defaultImageUrl ?? "", defaultRobots: data.defaultRobots,
        organizationName: data.organizationName, organizationLogo: data.organizationLogo ?? "",
        socialFacebook: data.socialFacebook ?? "", socialTwitter: data.socialTwitter ?? "",
        socialInstagram: data.socialInstagram ?? "", socialLinkedin: data.socialLinkedin ?? "",
        googleNewsPubName: data.googleNewsPubName ?? "", googleNewsPubLogo: data.googleNewsPubLogo ?? "",
      });
    }).catch(() => setError("Failed to load settings.")).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const cleaned = { ...form, defaultImageUrl: form.defaultImageUrl || null, organizationLogo: form.organizationLogo || null, socialFacebook: form.socialFacebook || null, socialTwitter: form.socialTwitter || null, socialInstagram: form.socialInstagram || null, socialLinkedin: form.socialLinkedin || null, googleNewsPubName: form.googleNewsPubName || null, googleNewsPubLogo: form.googleNewsPubLogo || null };
      await put("/seo/settings", cleaned);
      setSuccess("Settings saved.");
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); } finally { setSaving(false); }
  };

  if (loading) return <LoadingState variant="card" rows={4} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><h2 className="font-heading text-xl font-bold text-dnews-dark">SEO Settings</h2><p className="mt-1 text-sm text-dnews-muted">Global SEO configuration.</p></div>
      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}
      {success && <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20"><p className="text-xs font-medium text-green-700 dark:text-green-400">{success}</p></div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">General</h3>
          <div className="space-y-4">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Site Title</label><input type="text" value={form.siteTitle} onChange={(e) => setForm((p) => ({ ...p, siteTitle: e.target.value }))} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Default Description</label><textarea value={form.defaultDescription} onChange={(e) => setForm((p) => ({ ...p, defaultDescription: e.target.value }))} rows={2} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Default Image URL</label><input type="url" value={form.defaultImageUrl} onChange={(e) => setForm((p) => ({ ...p, defaultImageUrl: e.target.value }))} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
              <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Default Robots</label><select value={form.defaultRobots} onChange={(e) => setForm((p) => ({ ...p, defaultRobots: e.target.value }))} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent"><option value="index, follow">index, follow</option><option value="noindex, follow">noindex, follow</option><option value="index, nofollow">index, nofollow</option><option value="noindex, nofollow">noindex, nofollow</option></select></div>
            </div>
          </div>
        </div>
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Organization</h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Organization Name</label><input type="text" value={form.organizationName} onChange={(e) => setForm((p) => ({ ...p, organizationName: e.target.value }))} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
              <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Organization Logo URL</label><input type="url" value={form.organizationLogo} onChange={(e) => setForm((p) => ({ ...p, organizationLogo: e.target.value }))} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            </div>
          </div>
        </div>
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Google News</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Publication Name</label><input type="text" value={form.googleNewsPubName} onChange={(e) => setForm((p) => ({ ...p, googleNewsPubName: e.target.value }))} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Publication Logo URL</label><input type="url" value={form.googleNewsPubLogo} onChange={(e) => setForm((p) => ({ ...p, googleNewsPubLogo: e.target.value }))} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          </div>
        </div>
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Social Accounts</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Facebook</label><input type="url" value={form.socialFacebook} onChange={(e) => setForm((p) => ({ ...p, socialFacebook: e.target.value }))} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Twitter/X</label><input type="url" value={form.socialTwitter} onChange={(e) => setForm((p) => ({ ...p, socialTwitter: e.target.value }))} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Instagram</label><input type="url" value={form.socialInstagram} onChange={(e) => setForm((p) => ({ ...p, socialInstagram: e.target.value }))} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">LinkedIn</label><input type="url" value={form.socialLinkedin} onChange={(e) => setForm((p) => ({ ...p, socialLinkedin: e.target.value }))} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{saving ? "Saving..." : "Save Settings"}</button>
        </div>
      </form>
    </div>
  );
}
