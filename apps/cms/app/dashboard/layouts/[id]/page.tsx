"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Plus, Trash2, CheckCircle, Copy, AlertCircle,
  Eye, EyeOff, Globe, Calendar, Clock, User, Layers,
} from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import LoadingState from "@/components/dashboard/LoadingState";
import SectionCard from "@/components/layouts/SectionCard";
import SectionEditor from "@/components/layouts/SectionEditor";
import PreviewRenderer from "@/components/layouts/PreviewRenderer";
import { get, post, put, del } from "@dnews/api-client";
import type { HomePageLayout, Section } from "@dnews/types";
import { SECTION_TYPES } from "@dnews/types";

export default function LayoutDetailPage() {
  return (<RoleGuard roles={["Admin", "Editor"]}><LayoutDetailContent /></RoleGuard>);
}

function LayoutDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [layout, setLayout] = useState<HomePageLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "settings">("editor");

  const [sections, setSections] = useState<Section[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const fetchLayout = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const l = await get<HomePageLayout>(`/layouts/${id}`);
      setLayout(l);
      setSections(l.sections ?? []);
      setName(l.name);
      setSlug(l.slug);
      setIsDefault(l.isDefault);
    } catch {
      setError("Failed to load layout.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchLayout(); }, [fetchLayout]);

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError("");
    try {
      const updated = await put<HomePageLayout>(`/layouts/${id}`, {
        name: name.trim(), isDefault, sections: sections.map((s, i) => ({ ...s, position: i })),
      });
      setLayout(updated);
    } catch (err: any) {
      setError(err.message || "Failed to save layout.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true); setError("");
    try {
      await post(`/layouts/${id}/publish`, {});
      await fetchLayout();
    } catch (err: any) {
      setError(err.message || "Failed to publish layout.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this layout? This cannot be undone.")) return;
    try {
      await del(`/layouts/${id}`);
      router.push("/dashboard/layouts");
    } catch (err: any) {
      setError(err.message || "Failed to delete layout.");
    }
  };

  const handleDuplicate = async () => {
    try {
      const dup = await post<HomePageLayout>(`/layouts/${id}/duplicate`, {
        name: `${layout!.name} (Copy)`,
        slug: `${layout!.slug}-copy`,
      });
      router.push(`/dashboard/layouts/${dup.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to duplicate layout.");
    }
  };

  const saveSection = (section: Section) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === section.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...section, position: idx };
        return updated;
      }
      return [...prev, { ...section, position: prev.length }];
    });
    setShowEditor(false);
    setEditingSection(null);
  };

  const removeSection = (index: number) => {
    setSections(prev => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, position: i })));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    setSections(prev => {
      const updated = [...prev];
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated.map((s, i) => ({ ...s, position: i }));
    });
  };

  const toggleVisibility = (index: number) => {
    setSections(prev => prev.map((s, i) => i === index ? { ...s, visible: !s.visible } : s));
  };

  if (loading) return <LoadingState />;

  if (error && !layout) return (
    <div className="space-y-4">
      <Link href="/dashboard/layouts" className="inline-flex items-center gap-2 text-sm text-dnews-muted hover:text-dnews-accent">
        <ArrowLeft size={16} /> Back to layouts
      </Link>
      <div className="flex items-center gap-2 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
        <AlertCircle size={14} className="text-dnews-red" />
        <p className="text-sm text-dnews-red">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/layouts" className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-xl font-bold text-dnews-dark">{layout?.name}</h2>
              <StatusBadge status={layout?.status ?? "DRAFT"} />
              {layout?.isDefault && <span className="rounded bg-dnews-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-dnews-accent">Default</span>}
            </div>
            <p className="mt-0.5 text-xs text-dnews-muted">
              v{layout?.version} &middot; slug: /{layout?.slug} &middot; {layout?.sections?.length ?? 0} sections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {layout?.status !== "PUBLISHED" && (
            <button onClick={handlePublish} disabled={publishing}
              className="flex items-center gap-2 rounded-sm bg-green-600 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-green-700 disabled:opacity-60">
              <CheckCircle size={14} />
              {publishing ? "Publishing..." : "Publish"}
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-sm bg-dnews-accent px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60">
            <Save size={14} />
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={handleDuplicate}
            className="flex items-center gap-2 rounded-sm border border-dnews-border px-3 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray">
            <Copy size={14} /> Duplicate
          </button>
          {!layout?.isDefault && (
            <button onClick={handleDelete}
              className="flex items-center gap-2 rounded-sm border border-dnews-red/30 px-3 py-2 text-xs font-medium text-dnews-red transition-colors hover:bg-dnews-red/5">
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <AlertCircle size={14} className="text-dnews-red" />
          <p className="text-xs text-dnews-red">{error}</p>
        </div>
      )}

      {layout?.publishedAt && (
        <div className="flex items-center gap-4 rounded-sm bg-dnews-accent/5 border border-dnews-accent/20 px-4 py-2">
          <div className="flex items-center gap-1.5 text-xs text-dnews-accent">
            <Calendar size={12} />
            Published {new Date(layout.publishedAt).toLocaleDateString()}
          </div>
          {layout.scheduledAt && (
            <div className="flex items-center gap-1.5 text-xs text-dnews-muted">
              <Clock size={12} />
              Scheduled {new Date(layout.scheduledAt).toLocaleDateString()}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-dnews-muted">
            <User size={12} />
            {layout.createdBy.firstName} {layout.createdBy.lastName}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-dnews-muted">
            <Layers size={12} />
            v{layout.version}
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-dnews-border">
        {(["editor", "preview", "settings"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-dnews-accent text-dnews-accent"
                : "border-transparent text-dnews-muted hover:text-dnews-dark"
            }`}>
            {tab === "editor" ? "Section Editor" : tab === "preview" ? "Preview" : "Settings"}
          </button>
        ))}
      </div>

      {activeTab === "editor" && (
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-dnews-dark">Sections ({sections.length})</h3>
            <div className="relative group">
              <button className="flex items-center gap-1.5 rounded-sm bg-dnews-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-dnews-accent-light">
                <Plus size={14} /> Add Section
              </button>
              <div className="absolute right-0 top-full z-30 mt-1 hidden w-56 rounded-sm border border-dnews-border bg-dnews-card shadow-lg group-focus-within:block group-hover:block" onMouseDown={(e) => e.preventDefault()}>
                <div className="max-h-64 overflow-y-auto p-1">
                  {Object.entries(
                    SECTION_TYPES.reduce<Record<string, typeof SECTION_TYPES>>((acc, t) => {
                      (acc[t.group] ??= []).push(t);
                      return acc;
                    }, {})
                  ).map(([group, items]) => (
                    <div key={group}>
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-dnews-muted">{group}</div>
                      {items.map(t => (
                        <button key={t.value} onClick={() => setEditingSection({ type: t.value, title: null, subtitle: null, position: sections.length, visible: true, settings: {} } satisfies Section)}
                          className="w-full rounded-sm px-2 py-1.5 text-left text-xs text-dnews-dark transition-colors hover:bg-dnews-light-gray">
                          {t.label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {sections.length === 0 ? (
            <div className="flex items-center justify-center rounded-sm border-2 border-dashed border-dnews-border py-8">
              <p className="text-xs text-dnews-muted">No sections yet. Click &ldquo;Add Section&rdquo; to start building.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((section, index) => (
                <SectionCard key={section.id ?? index} section={section} index={index} total={sections.length}
                  onMoveUp={() => moveSection(index, -1)}
                  onMoveDown={() => moveSection(index, 1)}
                  onToggleVisibility={() => toggleVisibility(index)}
                  onRemove={() => removeSection(index)}
                  onEdit={() => { setEditingSection({ ...section }); setShowEditor(true); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "preview" && <PreviewRenderer sections={sections} />}

      {activeTab === "settings" && (
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-dnews-dark">Layout Settings</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dnews-gray">Layout Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dnews-gray">Slug</label>
              <input type="text" value={slug} disabled
                className="w-full rounded-sm border border-dnews-border bg-dnews-light-gray px-3 py-2 text-sm text-dnews-muted font-mono cursor-not-allowed"
              />
              <p className="mt-1 text-[10px] text-dnews-muted">Slug cannot be changed after creation.</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-dnews-border" />
              <span className="text-xs font-medium text-dnews-gray">Set as default layout</span>
            </label>
          </div>
        </div>
      )}

      {showEditor && (
        <SectionEditor
          section={editingSection}
          onSave={saveSection}
          onClose={() => { setShowEditor(false); setEditingSection(null); }}
        />
      )}
    </div>
  );
}
