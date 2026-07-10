"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { Play, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import LoadingState from "@/components/dashboard/LoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get, post, patch, del } from "@/lib/api-client";
import type { NewsletterAutomation, CreateAutomationInput, AutomationFrequency } from "@/types/automation";
import type { NewsletterTemplate } from "@/types/template";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AutomationPage() {
  return (
    <RoleGuard roles={["Admin"]}>
      <AutomationContent />
    </RoleGuard>
  );
}

function AutomationContent() {
  const [automations, setAutomations] = useState<NewsletterAutomation[]>([]);
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<AutomationFrequency>("WEEKLY");
  const [sendDay, setSendDay] = useState("1");
  const [sendTime, setSendTime] = useState("09:00");
  const [templateId, setTemplateId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [autoData, tmplData] = await Promise.all([
        get<NewsletterAutomation[]>("/newsletter/automations"),
        get<NewsletterTemplate[]>("/newsletter/templates"),
      ]);
      setAutomations(autoData);
      setTemplates(tmplData);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); } }, [success]);

  const resetForm = () => {
    setName(""); setFrequency("WEEKLY"); setSendDay("1"); setSendTime("09:00"); setTemplateId(""); setEditingId(null);
  };

  const openEdit = (a: NewsletterAutomation) => {
    setName(a.name); setFrequency(a.frequency); setSendDay(String(a.sendDay ?? 1)); setSendTime(a.sendTime); setTemplateId(a.templateId); setEditingId(a.id); setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !templateId || !sendTime) { setError("All fields required."); return; }
    setSubmitting(true);
    try {
      const body: CreateAutomationInput = {
        name, frequency,
        sendDay: frequency !== "DAILY" ? Number(sendDay) : undefined,
        sendTime, templateId,
      };
      if (editingId) {
        await patch(`/newsletter/automations/${editingId}`, body);
      } else {
        await post("/newsletter/automations", body);
      }
      setSuccess(editingId ? "Automation updated." : "Automation created.");
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (a: NewsletterAutomation) => {
    try {
      await patch(`/newsletter/automations/${a.id}`, { enabled: !a.enabled });
      fetchData();
    } catch { setError("Failed to toggle automation."); }
  };

  const handleRun = async (id: string) => {
    try {
      await post(`/newsletter/automations/${id}/run`);
      setSuccess("Digest campaign created as draft.");
      fetchData();
    } catch { setError("Failed to run automation."); }
  };

  const handleDelete = async (id: string) => {
    try {
      await del(`/newsletter/automations/${id}`);
      setAutomations((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Automation deleted.");
    } catch { setError("Failed to delete automation."); }
  };

  const columns: Column<NewsletterAutomation>[] = [
    { key: "name", header: "Name", render: (a) => <span className="text-sm font-medium text-dnews-dark">{a.name}</span> },
    { key: "frequency", header: "Frequency", render: (a) => <span className="text-xs text-dnews-gray">{a.frequency}</span> },
    {
      key: "schedule", header: "Schedule", render: (a) => (
        <span className="text-xs text-dnews-muted">
          {a.frequency === "DAILY" ? "Every day" : a.frequency === "WEEKLY" ? DAYS[a.sendDay ?? 1] : `Day ${a.sendDay ?? 1}`} at {a.sendTime}
        </span>
      ),
    },
    {
      key: "template", header: "Template", render: (a) => <span className="text-xs text-dnews-muted">{a.template?.name || "—"}</span>,
    },
    { key: "enabled", header: "Status", render: (a) => <span className={`text-xs font-medium ${a.enabled ? "text-green-600" : "text-dnews-muted"}`}>{a.enabled ? "Active" : "Disabled"}</span> },
    {
      key: "nextRun", header: "Next Run", render: (a) => (
        <span className="whitespace-nowrap text-xs text-dnews-muted">{a.nextRun ? new Date(a.nextRun).toLocaleString() : "—"}</span>
      ),
    },
    {
      key: "actions", header: "Actions", className: "text-right", render: (a) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => handleToggle(a)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray" title={a.enabled ? "Disable" : "Enable"}>{a.enabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}</button>
          <button onClick={() => openEdit(a)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent" title="Edit">&#9998;</button>
          <button onClick={() => handleRun(a.id)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-green-600" title="Run now"><Play size={14} /></button>
          <button onClick={() => handleDelete(a.id)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red" title="Delete"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">Automation</h2>
          <p className="mt-1 text-sm text-dnews-muted">Schedule automatic newsletter digests.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"><Plus size={14} /> New Automation</button>
      </div>

      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}
      {success && <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20"><p className="text-xs font-medium text-green-700 dark:text-green-400">{success}</p></div>}

      <DataTable columns={columns} data={automations} keyExtractor={(a) => a.id} loading={loading}
        emptyTitle="No automations configured"
        emptyDescription="Set up automatic digests to send on a schedule."
      />

      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editingId ? "Edit Automation" : "New Automation"} size="md"
        footer={<>
          <button onClick={() => { setShowForm(false); resetForm(); }} className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{submitting ? "Saving..." : editingId ? "Update" : "Create"}</button>
        </>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly Digest" required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as AutomationFrequency)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          {frequency !== "DAILY" && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Day</label>
              {frequency === "WEEKLY" ? (
                <select value={sendDay} onChange={(e) => setSendDay(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              ) : (
                <input type="number" min={1} max={28} value={sendDay} onChange={(e) => setSendDay(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
              )}
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Time</label>
            <input type="time" value={sendTime} onChange={(e) => setSendTime(e.target.value)} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Template</label>
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
              <option value="">Select template</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
