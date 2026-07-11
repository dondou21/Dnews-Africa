"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { get, post } from "@/lib/api-client";
import RoleGuard from "@/components/dashboard/RoleGuard";
import type { AdType, AdPlacement, AdRotation } from "@/types/advertisement";

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

export default function NewAdPage() {
  return (<RoleGuard roles={["Admin"]}><NewAdForm /></RoleGuard>);
}

function NewAdForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [advertisers, setAdvertisers] = useState<{ id: string; companyName: string }[]>([]);
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [media, setMedia] = useState<{ id: string; url: string; alt: string | null }[]>([]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<AdType>("BANNER");
  const [placement, setPlacement] = useState<AdPlacement>("HOMEPAGE_SIDEBAR");
  const [targetUrl, setTargetUrl] = useState("");
  const [advertiserId, setAdvertiserId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [imageId, setImageId] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [description, setDescription] = useState("");
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
        const [advs, camps, med] = await Promise.all([
          get<{ id: string; companyName: string }[]>("/advertisers/list"),
          get<{ id: string; name: string }[]>("/ad-campaigns?limit=100").then(r => (r as any).campaigns || []),
          get<{ id: string; url: string; alt: string | null }[]>("/media").catch(() => []),
        ]);
        setAdvertisers(advs);
        setCampaigns(camps);
        setMedia(med);
      } catch { setError("Failed to load form data."); }
    }
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !targetUrl || !advertiserId) { setError("Title, target URL, and advertiser are required."); return; }
    setSubmitting(true);
    try {
      await post("/advertisements", {
        title, type, placement, targetUrl, advertiserId,
        campaignId: campaignId || undefined,
        imageId: imageId || undefined,
        buttonText: buttonText || undefined,
        description: description || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        priority: Number(priority),
        maxImpressions: maxImpressions ? Number(maxImpressions) : undefined,
        maxClicks: maxClicks ? Number(maxClicks) : undefined,
        rotation, weight: Number(weight),
      });
      router.push("/dashboard/advertisements/ads");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create ad.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/advertisements/ads" className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-gray hover:bg-dnews-light-gray"><ArrowLeft size={18} /></Link>
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">New Advertisement</h2>
          <p className="text-sm text-dnews-muted">Create a new advertisement.</p>
        </div>
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
              <input type="url" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://example.com" required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Button Text</label>
                <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Learn More" className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Priority</label>
                <input type="number" min={0} value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Media & Advertiser</h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Advertiser <span className="text-dnews-red">*</span></label>
                <select value={advertiserId} onChange={(e) => setAdvertiserId(e.target.value)} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
                  <option value="">Select advertiser</option>
                  {advertisers.map((a) => <option key={a.id} value={a.id}>{a.companyName}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Campaign</label>
                <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
                  <option value="">None</option>
                  {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Image (from Media Library)</label>
              <select value={imageId} onChange={(e) => setImageId(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
                <option value="">No image</option>
                {media.map((m) => <option key={m.id} value={m.id}>{m.alt || m.url}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Scheduling & Limits</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Max Impressions</label>
              <input type="number" min={1} value={maxImpressions} onChange={(e) => setMaxImpressions(e.target.value)} placeholder="Unlimited" className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Max Clicks</label>
              <input type="number" min={1} value={maxClicks} onChange={(e) => setMaxClicks(e.target.value)} placeholder="Unlimited" className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Rotation</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Rotation Type</label>
              <select value={rotation} onChange={(e) => setRotation(e.target.value as AdRotation)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
                <option value="RANDOM">Random</option>
                <option value="PRIORITY">Priority</option>
                <option value="WEIGHTED">Weighted</option>
                <option value="SEQUENTIAL">Sequential</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Weight</label>
              <input type="number" min={1} value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/advertisements/ads" className="rounded-sm border border-dnews-border px-5 py-2.5 text-xs font-medium text-dnews-gray">Cancel</Link>
          <button type="submit" disabled={submitting} className="rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{submitting ? "Saving..." : "Create Advertisement"}</button>
        </div>
      </form>
    </div>
  );
}
