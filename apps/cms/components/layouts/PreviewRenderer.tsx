"use client";

import { SECTION_TYPES } from "@dnews/types";
import type { Section } from "@dnews/types";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

interface PreviewRendererProps {
  sections: Section[];
}

type Device = "desktop" | "tablet" | "mobile";

const TYPE_PREVIEWS: Record<string, (s: Section) => React.ReactNode> = {
  hero_slider: (s) => (
    <div className="relative h-48 overflow-hidden rounded-sm bg-gradient-to-r from-dnews-dark to-dnews-accent">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg font-bold">{s.title || "Hero Slider"}</p>
          {s.subtitle && <p className="mt-1 text-xs opacity-80">{s.subtitle}</p>}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {Array.from({ length: Math.min(s.settings?.articleCount ?? 5, 5) }).map((_, i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full ${i === 0 ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  ),

  breaking_news: (s) => (
    <div className="flex items-center gap-2 rounded-sm bg-dnews-red/10 px-3 py-2">
      <span className="shrink-0 rounded bg-dnews-red px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Breaking</span>
      <div className="flex-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-xs text-dnews-dark">{s.title || "Breaking News Ticker"}</div>
      </div>
    </div>
  ),

  top_stories: (s) => (
    <div>
      {s.title && <h3 className="mb-2 text-sm font-bold text-dnews-dark">{s.title}</h3>}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: Math.min(s.settings?.articleCount ?? 3, 6) }).map((_, i) => (
          <div key={i} className="aspect-video rounded-sm bg-dnews-light-gray" />
        ))}
      </div>
    </div>
  ),

  latest_news: (s) => (
    <div>
      {s.title && <h3 className="mb-2 text-sm font-bold text-dnews-dark">{s.title}</h3>}
      <div className="space-y-1.5">
        {Array.from({ length: Math.min(s.settings?.articleCount ?? 5, 5) }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 rounded-sm border border-dnews-border p-2">
            <div className="h-8 w-8 shrink-0 rounded-sm bg-dnews-light-gray" />
            <div className="flex-1">
              <div className="h-2.5 w-full rounded bg-dnews-light-gray" />
              <div className="mt-1 h-2 w-2/3 rounded bg-dnews-light-gray" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  category_block: (s) => (
    <div>
      {s.title && <h3 className="mb-2 text-sm font-bold text-dnews-dark">{s.title}</h3>}
      <div className="grid grid-cols-2 gap-2">
        <div className="aspect-video rounded-sm bg-gradient-to-br from-dnews-accent/20 to-dnews-accent/5 flex items-center justify-center text-[10px] text-dnews-muted">{s.subtitle || "Category"}</div>
        <div className="aspect-video rounded-sm bg-gradient-to-br from-dnews-accent/20 to-dnews-accent/5 flex items-center justify-center text-[10px] text-dnews-muted">Articles</div>
      </div>
    </div>
  ),

  editors_picks: (s) => (
    <div className="rounded-sm border border-dnews-accent/20 bg-dnews-accent/5 p-3">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="text-xs font-bold text-dnews-accent uppercase tracking-wider">{s.title || "Editor's Picks"}</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dnews-accent text-[10px] font-bold text-white">{i + 1}</span>
            <div className="h-2 flex-1 rounded bg-dnews-light-gray" />
          </div>
        ))}
      </div>
    </div>
  ),

  newsletter_block: (s) => (
    <div className="rounded-sm bg-gradient-to-r from-dnews-dark to-dnews-accent p-4 text-center text-white">
      <p className="text-sm font-bold">{s.title || "Subscribe to Newsletter"}</p>
      {s.subtitle && <p className="mt-1 text-[10px] opacity-80">{s.subtitle}</p>}
      <div className="mx-auto mt-3 flex max-w-xs gap-2">
        <div className="h-7 flex-1 rounded-sm bg-white/20" />
        <div className="h-7 w-16 rounded-sm bg-white/30" />
      </div>
    </div>
  ),

  advertisement_block: (s) => (
    <div className="flex items-center justify-center rounded-sm border-2 border-dashed border-dnews-border bg-dnews-light-gray py-6">
      <div className="text-center">
        <p className="text-[10px] font-medium text-dnews-muted uppercase tracking-wider">Advertisement</p>
        <p className="text-[10px] text-dnews-muted">{s.settings?.adPlacement ?? "banner"} placement</p>
      </div>
    </div>
  ),

  video_section: (s) => (
    <div>
      {s.title && <h3 className="mb-2 text-sm font-bold text-dnews-dark">{s.title}</h3>}
      <div className="flex items-center justify-center aspect-video rounded-sm bg-dnews-dark">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
          <div className="ml-0.5 h-0 w-0 border-y-6 border-l-8 border-y-transparent border-l-white" />
        </div>
      </div>
    </div>
  ),

  photo_gallery: (s) => (
    <div>
      {s.title && <h3 className="mb-2 text-sm font-bold text-dnews-dark">{s.title}</h3>}
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`aspect-square rounded-sm bg-dnews-light-gray ${i === 0 ? "col-span-2 row-span-2" : ""}`} />
        ))}
      </div>
    </div>
  ),

  weather_widget: (s) => (
    <div className="rounded-sm bg-gradient-to-br from-sky-400 to-sky-600 p-3 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">28°</p>
          <p className="text-[10px] opacity-80">Accra, Ghana</p>
        </div>
        <div className="text-3xl opacity-80">☀️</div>
      </div>
    </div>
  ),

  social_feed: (s) => (
    <div className="rounded-sm border border-dnews-border p-3">
      <p className="mb-2 text-xs font-bold text-dnews-dark">{s.title || "Social Feed"}</p>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <div className="h-6 w-6 shrink-0 rounded-full bg-dnews-light-gray" />
            <div className="flex-1">
              <div className="h-2 w-16 rounded bg-dnews-light-gray" />
              <div className="mt-1 h-2 w-full rounded bg-dnews-light-gray" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

function SectionPreview({ section }: { section: Section }) {
  const preview = TYPE_PREVIEWS[section.type];
  const typeInfo = SECTION_TYPES.find(t => t.value === section.type);
  const typeLabel = typeInfo?.label ?? section.type.replace(/_/g, " ");

  if (!section.visible) return null;

  return (
    <div className="rounded-sm border border-dnews-border bg-dnews-card p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-dnews-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-dnews-accent uppercase tracking-wider">{typeLabel}</span>
        {section.settings?.layout && (
          <span className="rounded bg-dnews-light-gray px-1.5 py-0.5 text-[10px] text-dnews-muted">{section.settings.layout}</span>
        )}
      </div>
      {preview ? preview(section) : (
        <div className="flex items-center justify-center rounded-sm border-2 border-dashed border-dnews-border py-8">
          <p className="text-xs text-dnews-muted">{typeLabel} Section</p>
        </div>
      )}
    </div>
  );
}

export default function PreviewRenderer({ sections }: PreviewRendererProps) {
  const [device, setDevice] = useState<Device>("desktop");

  const deviceClasses: Record<Device, string> = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-dnews-dark">Preview</h3>
        <div className="flex items-center gap-1 rounded-sm border border-dnews-border p-0.5">
          {[
            { value: "desktop" as Device, icon: Monitor },
            { value: "tablet" as Device, icon: Tablet },
            { value: "mobile" as Device, icon: Smartphone },
          ].map(({ value, icon: Icon }) => (
            <button key={value} onClick={() => setDevice(value)}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-sm transition-colors ${device === value ? "bg-dnews-accent text-white" : "text-dnews-muted hover:text-dnews-accent"}`}>
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-sm border border-dnews-border bg-dnews-bg">
        <div className="flex justify-center py-4">
          <div className={`${deviceClasses[device]} min-h-[200px] space-y-3 px-3 transition-all duration-300`}>
            {sections.filter(s => s.visible).length === 0 ? (
              <div className="flex items-center justify-center py-12 text-center">
                <p className="text-xs text-dnews-muted">No sections yet. Add sections to build your homepage.</p>
              </div>
            ) : sections.filter(s => s.visible).map((section, i) => (
              <SectionPreview key={section.id ?? i} section={section} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
