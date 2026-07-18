"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { get, patch } from "@dnews/api-client";
import RoleGuard from "@/components/dashboard/RoleGuard";
import LoadingState from "@/components/dashboard/LoadingState";
import Modal from "@/components/dashboard/Modal";
import type { NewsletterTemplate, UpdateTemplateInput } from "@dnews/types";

export default function EditTemplatePage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <EditTemplateForm />
    </RoleGuard>
  );
}

function EditTemplateForm() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await get<NewsletterTemplate>(`/newsletter/templates/${id}`);
        setName(data.name);
        setDescription(data.description || "");
        setSubject(data.subject);
        setContent(data.content);
      } catch {
        setError("Failed to load template.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !subject || !content) {
      setError("Name, subject, and content are required.");
      return;
    }
    setSubmitting(true);
    try {
      const body: UpdateTemplateInput = { name, subject, content, description: description || undefined };
      await patch(`/newsletter/templates/${id}`, body);
      router.push("/dashboard/newsletter/templates");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update template.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="space-y-6"><div className="flex items-center gap-4"><div className="h-8 w-8 rounded bg-dnews-border/50 animate-pulse" /><div><div className="h-6 w-48 rounded bg-dnews-border/50 animate-pulse" /></div></div><LoadingState variant="card" rows={3} /></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/newsletter/templates" className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-gray transition-colors hover:bg-dnews-light-gray"><ArrowLeft size={18} /></Link>
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">Edit Template</h2>
          <p className="text-sm text-dnews-muted">Editing: {name}</p>
        </div>
      </div>

      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Template Details</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Name <span className="text-dnews-red">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Subject Line <span className="text-dnews-red">*</span></label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">HTML Content <span className="text-dnews-red">*</span></label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={16} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark font-mono outline-none transition-colors focus:border-dnews-accent" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => setPreviewOpen(true)} className="flex items-center gap-2 rounded-sm border border-dnews-border px-5 py-2.5 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"><Eye size={14} /> Preview</button>
          <Link href="/dashboard/newsletter/templates" className="rounded-sm border border-dnews-border px-5 py-2.5 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray">Cancel</Link>
          <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60">{submitting ? "Saving..." : "Save Changes"}</button>
        </div>
      </form>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Template Preview" size="lg">
        <div className="rounded-sm border border-dnews-border bg-dnews-bg p-4">
          <div className="prose prose-sm max-w-none text-dnews-dark" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </Modal>
    </div>
  );
}
