"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, AlertCircle, Eye, EyeOff } from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import SectionCard from "@/components/layouts/SectionCard";
import SectionEditor from "@/components/layouts/SectionEditor";
import PreviewRenderer from "@/components/layouts/PreviewRenderer";
import { post } from "@/lib/api-client";
import type { Section, HomePageLayout } from "@/types/layout";
import { SECTION_TYPES } from "@/types/layout";

export default function NewLayoutPage() {
  return (<RoleGuard roles={["Admin", "Editor"]}><NewLayoutContent /></RoleGuard>);
}

function NewLayoutContent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const generateSlug = useCallback((val: string) => {
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  }, []);

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!slug.trim()) { setError("Slug is required."); return; }
    setSaving(true); setError("");
    try {
      const layout = await post<HomePageLayout>("/layouts", {
        name: name.trim(), slug: slug.trim(), isDefault, sections: sections.map((s, i) => ({ ...s, position: i })),
      });
      router.push(`/dashboard/layouts/${layout.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create layout.");
    } finally {
      setSaving(false);
    }
  };

  const addSection = (type: string) => {
    const newSection: Section = {
      type, title: null, subtitle: null, position: sections.length,
      visible: true, settings: {},
    };
    setEditingSection(newSection);
    setShowEditor(true);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/layouts" className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-heading text-xl font-bold text-dnews-dark">New Layout</h2>
            <p className="mt-1 text-sm text-dnews-muted">Create a new homepage layout.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 rounded-sm border border-dnews-border px-3 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray">
            {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60">
            <Save size={14} />
            {saving ? "Saving..." : "Save Draft"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <AlertCircle size={14} className="text-dnews-red" />
          <p className="text-xs text-dnews-red">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6" style={showPreview ? { gridTemplateColumns: "1fr 1fr" } : undefined}>
        <div className="space-y-5">
          <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-dnews-dark">Layout Details</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-dnews-gray">Layout Name</label>
                <input type="text" value={name}
                  onChange={(e) => { setName(e.target.value); generateSlug(e.target.value); }}
                  placeholder="e.g., Default Homepage"
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent placeholder:text-dnews-muted"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-dnews-gray">Slug</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                  placeholder="default-homepage"
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent placeholder:text-dnews-muted font-mono"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-dnews-border" />
                <span className="text-xs font-medium text-dnews-gray">Set as default layout</span>
              </label>
            </div>
          </div>

          <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-dnews-dark">Sections</h3>
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
                          <button key={t.value} onClick={() => addSection(t.value)}
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
                <p className="text-xs text-dnews-muted">No sections yet. Click &ldquo;Add Section&rdquo; to start building your homepage.</p>
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
        </div>

        {showPreview && (
          <div className="sticky top-6 self-start">
            <PreviewRenderer sections={sections} />
          </div>
        )}
      </div>

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
