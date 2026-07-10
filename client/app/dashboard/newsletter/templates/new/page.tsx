"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye } from "lucide-react";
import { post } from "@/lib/api-client";
import RoleGuard from "@/components/dashboard/RoleGuard";
import Modal from "@/components/dashboard/Modal";
import type { CreateTemplateInput } from "@/types/template";

export default function NewTemplatePage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <NewTemplateForm />
    </RoleGuard>
  );
}

function NewTemplateForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !subject || !content) {
      setError("Name, subject, and content are required.");
      return;
    }
    setSubmitting(true);
    try {
      const body: CreateTemplateInput = { name, subject, content, description: description || undefined };
      await post("/newsletter/templates", body);
      router.push("/dashboard/newsletter/templates");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create template.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/newsletter/templates" className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-gray transition-colors hover:bg-dnews-light-gray"><ArrowLeft size={18} /></Link>
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">New Template</h2>
          <p className="text-sm text-dnews-muted">Create a new email template.</p>
        </div>
      </div>

      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
          <h3 className="mb-4 font-heading text-base font-semibold text-dnews-dark">Template Details</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Name <span className="text-dnews-red">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly Digest" required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Brief description of this template" className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Subject Line <span className="text-dnews-red">*</span></label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Your Weekly Digest" required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">HTML Content <span className="text-dnews-red">*</span></label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={16} placeholder="<h1>Your email content here (HTML supported)</h1>" required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2.5 text-sm text-dnews-dark font-mono outline-none transition-colors focus:border-dnews-accent" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => setPreviewOpen(true)} className="flex items-center gap-2 rounded-sm border border-dnews-border px-5 py-2.5 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"><Eye size={14} /> Preview</button>
          <Link href="/dashboard/newsletter/templates" className="rounded-sm border border-dnews-border px-5 py-2.5 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray">Cancel</Link>
          <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60">{submitting ? "Saving..." : "Create Template"}</button>
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
