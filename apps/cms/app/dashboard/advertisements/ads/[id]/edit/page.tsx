"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { get, patch } from "@dnews/api-client";
import RoleGuard from "@/components/dashboard/RoleGuard";
import LoadingState from "@/components/dashboard/LoadingState";
import type { Advertisement, AdType, AdPlacement, AdRotation } from "@dnews/types";

const AD_TYPES: { value: AdType; label: string }[] = [
  { value: "BANNER", label: "Banner" }, { value: "LEADERBOARD", label: "Leaderboard" },
  { value: "SIDEBAR", label: "Sidebar" }, { value: "SQUARE", label: "Square" },
  { value: "RECTANGLE", label: "Rectangle" }, { value: "MOBILE_BANNER", label: "Mobile Banner" },
  { value: "POPUP", label: "Popup" }, { value: "INTERSTITIAL", label: "Interstitial" },
  { value: "SPONSORED_ARTICLE", label: "Sponsored Article" }, { value: "VIDEO", label: "Video" },
  { value: "NATIVE", label: "Native" },
];

const PLACEMENTS: { value: AdPlacement; label: string }[] = [
  { value: "HOMEPAGE_HERO", label: "Homepage Hero" }, { value: "HOMEPAGE_SIDEBAR", label: "Homepage Sidebar" },
  { value: "HOMEPAGE_BETWEEN", label: "Homepage Between Articles" }, { value: "CATEGORY_PAGES", label: "Category Pages" },
  { value: "ARTICLE_TOP", label: "Article Top" }, { value: "ARTICLE_MIDDLE", label: "Article Middle" },
  { value: "ARTICLE_BOTTOM", label: "Article Bottom" }, { value: "FOOTER", label: "Footer" },
  { value: "HEADER", label: "Header" }, { value: "NEWSLETTER", label: "Newsletter" },
  { value: "SEARCH_RESULTS", label: "Search Results" }, { value: "MOBILE_FEED", label: "Mobile Feed" },
];

export default function EditAdPage() {
  return (<RoleGuard roles={["Admin"]}><EditAdForm /></RoleGuard>);
}

function EditAdForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [advertisers, setAdvertisers] = useState<{ id: string; companyName: string }[]>([]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<AdType>("BANNER");
  const [placement, setPlacement] = useState<AdPlacement>("HOMEPAGE_SIDEBAR");
  const [targetUrl, setTargetUrl] = useState("");
  const [advertiserId, setAdvertiserId] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("0");
  const [maxImpressions, setMaxImpressions] = useState("");
  const [maxClicks, setMaxClicks] = useState("");
  const [rotation, setRotation] = useState<AdRotation>("RANDOM");
  const [weight, setWeight] = useState("1");

  useEffect(() => {
    async function load() {
      try {
        const [ad, advs] = await Promise.all([
          get<Advertisement>(`/advertisements/${id}`),
          get<{ id: string; companyName: string }[]>("/advertisers/list"),
        ]);
        setTitle(ad.title); setType(ad.type); setPlacement(ad.placement);
        setTargetUrl(ad.targetUrl); setAdvertiserId(ad.advertiserId);
        setDescription(ad.description || ""); setButtonText(ad.buttonText || "");
        setStartDate(ad.startDate ? ad.startDate.split("T")[0] : "");
        setEndDate(ad.endDate ? ad.endDate.split("T")[0] : "");
        setPriority(String(ad.priority));
        setMaxImpressions(ad.maxImpressions ? String(ad.maxImpressions) : "");
        setMaxClicks(ad.maxClicks ? String(ad.maxClicks) : "");
        setRotation(ad.rotation); setWeight(String(ad.weight));
        setAdvertisers(advs);
      } catch { setError("Failed to load ad."); } finally { setLoading(false); }
    }
    load();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !targetUrl || !advertiserId) { setError("Title, target URL, and advertiser are required."); return; }
    setSubmitting(true);
    try {
      await patch(`/advertisements/${id}`, {
        title, type, placement, targetUrl, advertiserId,
        description: description || undefined,
        buttonText: buttonText || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        priority: Number(priority),
        maxImpressions: maxImpressions ? Number(maxImpressions) : null,
        maxClicks: maxClicks ? Number(maxClicks) : null,
        rotation, weight: Number(weight),
      });
      router.push("/dashboard/advertisements/ads");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update ad.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="space-y-6"><div className="flex items-center gap-4"><div className="h-8 w-8 rounded bg-dnews-border/50 animate-pulse" /><div><div className="h-6 w-48 rounded bg-dnews-border/50 animate-pulse" /></div></div><LoadingState variant="card" rows={3} /></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/advertisements/ads" className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-gray hover:bg-dnews-light-gray"><ArrowLeft size={18} /></Link>
        <div><h2 className="font-heading text-xl font-bold text-dnews-dark">Edit Advertisement</h2><p className="text-sm text-dnews-muted">Editing: {title}</p></div>
      </div>
      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Ad Details</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Title <span className="text-dnews-red">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as AdType)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
                  {AD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Placement</label>
                <select value={placement} onChange={(e) => setPlacement(e.target.value as AdPlacement)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
                  {PLACEMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Target URL <span className="text-dnews-red">*</span></label>
              <input type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Button Text</label>
                <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Priority</label>
                <input type="number" min={0} value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Advertiser</h3>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Advertiser <span className="text-dnews-red">*</span></label>
            <select value={advertiserId} onChange={(e) => setAdvertiserId(e.target.value)} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
              <option value="">Select advertiser</option>
              {advertisers.map((a) => <option key={a.id} value={a.id}>{a.companyName}</option>)}
            </select>
          </div>
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Scheduling & Limits</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Max Impressions</label><input type="number" min={1} value={maxImpressions} onChange={(e) => setMaxImpressions(e.target.value)} placeholder="Unlimited" className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Max Clicks</label><input type="number" min={1} value={maxClicks} onChange={(e) => setMaxClicks(e.target.value)} placeholder="Unlimited" className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          </div>
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Rotation</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Rotation Type</label>
              <select value={rotation} onChange={(e) => setRotation(e.target.value as AdRotation)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
                <option value="RANDOM">Random</option><option value="PRIORITY">Priority</option><option value="WEIGHTED">Weighted</option><option value="SEQUENTIAL">Sequential</option>
              </select>
            </div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Weight</label><input type="number" min={1} value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/advertisements/ads" className="rounded-sm border border-dnews-border px-5 py-2.5 text-xs font-medium text-dnews-gray">Cancel</Link>
          <button type="submit" disabled={submitting} className="rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{submitting ? "Saving..." : "Save Changes"}</button>
        </div>
      </form>
    </div>
  );
}
