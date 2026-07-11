"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SECTION_TYPES, DEFAULT_SECTION_SETTINGS } from "@/types/layout";
import type { Section, SectionSettings } from "@/types/layout";

interface SectionEditorProps {
  section: Section | null;
  onSave: (section: Section) => void;
  onClose: () => void;
}

export default function SectionEditor({ section, onSave, onClose }: SectionEditorProps) {
  const isNew = !section?.id;
  const [type, setType] = useState(section?.type ?? SECTION_TYPES[0].value);
  const [title, setTitle] = useState(section?.title ?? "");
  const [subtitle, setSubtitle] = useState(section?.subtitle ?? "");
  const [visible, setVisible] = useState(section?.visible ?? true);
  const [settings, setSettings] = useState<Record<string, any>>(section?.settings ?? {});

  const currentTypeInfo = SECTION_TYPES.find(t => t.value === type);
  const currentGroup = currentTypeInfo?.group ?? "Content";

  useEffect(() => {
    if (isNew) {
      const defaults = DEFAULT_SECTION_SETTINGS[type] ?? {};
      setSettings({ ...defaults });
    }
  }, [type, isNew]);

  const handleSave = () => {
    onSave({
      ...section,
      type,
      title: title || null,
      subtitle: subtitle || null,
      visible,
      settings: settings as SectionSettings,
    } as Section);
  };

  const grouped = SECTION_TYPES.reduce<Record<string, typeof SECTION_TYPES>>((acc, t) => {
    (acc[t.group] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-sm border border-dnews-border bg-dnews-card shadow-xl">
        <div className="flex items-center justify-between border-b border-dnews-border px-5 py-4">
          <h3 className="text-sm font-semibold text-dnews-dark">
            {isNew ? "Add Section" : "Edit Section"}
          </h3>
          <button onClick={onClose} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-dark">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dnews-gray">Section Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={!isNew}
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent disabled:opacity-60"
            >
              {Object.entries(grouped).map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-dnews-gray">Title (optional)</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder={`${currentTypeInfo?.label ?? "Section"} title`}
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent placeholder:text-dnews-muted"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-dnews-gray">Subtitle (optional)</label>
            <input
              type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Subtitle or description"
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent placeholder:text-dnews-muted"
            />
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold text-dnews-dark uppercase tracking-wider">Section Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              {(currentGroup === "Hero" || type.includes("story") || type.includes("news") || type === "category_block" || type === "editors_picks") && (
                <>
                  <div>
                    <label className="mb-1 block text-xs text-dnews-gray">Article Count</label>
                    <input type="number" min={1} max={50}
                      value={settings.articleCount ?? 5}
                      onChange={(e) => setSettings(s => ({ ...s, articleCount: parseInt(e.target.value) || 5 }))}
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-sm outline-none focus:border-dnews-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-dnews-gray">Source</label>
                    <select value={settings.source ?? "latest"}
                      onChange={(e) => setSettings(s => ({ ...s, source: e.target.value }))}
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-sm outline-none focus:border-dnews-accent">
                      <option value="latest">Latest</option>
                      <option value="trending">Trending</option>
                      <option value="most_read">Most Read</option>
                      <option value="editors_picks">Editor&apos;s Picks</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-dnews-gray">Layout</label>
                    <select value={settings.layout ?? "grid"}
                      onChange={(e) => setSettings(s => ({ ...s, layout: e.target.value }))}
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-sm outline-none focus:border-dnews-accent">
                      <option value="grid">Grid</option>
                      <option value="list">List</option>
                      <option value="carousel">Carousel</option>
                      <option value="masonry">Masonry</option>
                      <option value="compact">Compact</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-dnews-gray">Sort Order</label>
                    <select value={settings.sortOrder ?? "latest"}
                      onChange={(e) => setSettings(s => ({ ...s, sortOrder: e.target.value }))}
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-sm outline-none focus:border-dnews-accent">
                      <option value="latest">Latest</option>
                      <option value="oldest">Oldest</option>
                      <option value="trending">Trending</option>
                      <option value="popular">Popular</option>
                      <option value="random">Random</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-dnews-gray">Image Size</label>
                    <select value={settings.imageSize ?? "medium"}
                      onChange={(e) => setSettings(s => ({ ...s, imageSize: e.target.value }))}
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-sm outline-none focus:border-dnews-accent">
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="full">Full Width</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4 col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={settings.showTitle ?? true}
                        onChange={(e) => setSettings(s => ({ ...s, showTitle: e.target.checked }))}
                        className="rounded border-dnews-border" />
                      <span className="text-xs text-dnews-gray">Show Title</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={settings.showExcerpt ?? false}
                        onChange={(e) => setSettings(s => ({ ...s, showExcerpt: e.target.checked }))}
                        className="rounded border-dnews-border" />
                      <span className="text-xs text-dnews-gray">Show Excerpt</span>
                    </label>
                  </div>
                </>
              )}
              {type === "hero_slider" && (
                <div className="col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={settings.autoPlay ?? true}
                      onChange={(e) => setSettings(s => ({ ...s, autoPlay: e.target.checked }))}
                      className="rounded border-dnews-border" />
                    <span className="text-xs text-dnews-gray">Auto-play</span>
                  </label>
                  <div>
                    <label className="mb-1 block text-xs text-dnews-gray">Interval (ms)</label>
                    <input type="number" min={2000} max={30000} step={1000}
                      value={settings.slideInterval ?? 5000}
                      onChange={(e) => setSettings(s => ({ ...s, slideInterval: parseInt(e.target.value) || 5000 }))}
                      className="w-24 rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-sm outline-none focus:border-dnews-accent"
                    />
                  </div>
                </div>
              )}
              {type === "advertisement_block" && (
                <div className="col-span-2">
                  <label className="mb-1 block text-xs text-dnews-gray">Ad Placement</label>
                  <select value={settings.adPlacement ?? "banner"}
                    onChange={(e) => setSettings(s => ({ ...s, adPlacement: e.target.value }))}
                    className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-sm outline-none focus:border-dnews-accent">
                    <option value="banner">Banner</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="in-article">In-article</option>
                    <option value="native">Native</option>
                  </select>
                </div>
              )}
              {type === "custom_html" && (
                <div className="col-span-2">
                  <label className="mb-1 block text-xs text-dnews-gray">Custom HTML</label>
                  <textarea rows={6}
                    value={settings.customHtml ?? ""}
                    onChange={(e) => setSettings(s => ({ ...s, customHtml: e.target.value }))}
                    className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm font-mono text-dnews-dark outline-none focus:border-dnews-accent"
                    placeholder="<div>Your custom HTML here...</div>"
                  />
                </div>
              )}
              <div className="col-span-2 border-t border-dnews-border pt-3 mt-2">
                <h5 className="mb-2 text-xs font-medium text-dnews-gray">Appearance</h5>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-dnews-gray">Theme</label>
                    <select value={settings.theme ?? "light"}
                      onChange={(e) => setSettings(s => ({ ...s, theme: e.target.value }))}
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-sm outline-none focus:border-dnews-accent">
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-dnews-gray">Bg Color</label>
                    <input type="text" value={settings.backgroundColor ?? ""}
                      onChange={(e) => setSettings(s => ({ ...s, backgroundColor: e.target.value }))}
                      placeholder="#ffffff"
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-sm outline-none focus:border-dnews-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-dnews-gray">Text Color</label>
                    <input type="text" value={settings.textColor ?? ""}
                      onChange={(e) => setSettings(s => ({ ...s, textColor: e.target.value }))}
                      placeholder="#000000"
                      className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-sm outline-none focus:border-dnews-accent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-dnews-border">
            <input type="checkbox" checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="rounded border-dnews-border" />
            <span className="text-xs font-medium text-dnews-gray">Visible on homepage</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-dnews-border px-5 py-4">
          <button onClick={onClose}
            className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray">
            Cancel
          </button>
          <button onClick={handleSave}
            className="rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light">
            {isNew ? "Add Section" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
