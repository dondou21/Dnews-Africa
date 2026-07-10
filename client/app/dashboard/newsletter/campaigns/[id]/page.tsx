"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Send, Ban, Clock, Eye } from "lucide-react";
import { get, post } from "@/lib/api-client";
import RoleGuard from "@/components/dashboard/RoleGuard";
import LoadingState from "@/components/dashboard/LoadingState";
import Modal from "@/components/dashboard/Modal";
import CampaignPreview from "@/components/newsletter/CampaignPreview";
import { useAuth } from "@/contexts/AuthContext";
import type { Campaign } from "@/types/campaign";

export default function CampaignDetailPage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <CampaignDetailContent />
    </RoleGuard>
  );
}

function CampaignDetailContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const isAdmin = user?.role.name === "Admin";

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendConfirm, setSendConfirm] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await get<Campaign>(`/newsletter/campaigns/${id}`);
        setCampaign(data);
      } catch {
        setError("Failed to load campaign.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleSend = async () => {
    setActionLoading(true);
    try {
      const updated = await post<Campaign>(`/newsletter/campaigns/${id}/send`);
      setCampaign(updated);
      setSuccess("Campaign is now sending.");
      setSendConfirm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      setError("Please select a date and time.");
      return;
    }
    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
    setActionLoading(true);
    try {
      const updated = await post<Campaign>(`/newsletter/campaigns/${id}/schedule`, {
        scheduledAt: scheduledAt.toISOString(),
      });
      setCampaign(updated);
      setSuccess("Campaign scheduled successfully.");
      setScheduleOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to schedule campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const updated = await post<Campaign>(`/newsletter/campaigns/${id}/cancel`);
      setCampaign(updated);
      setSuccess("Campaign cancelled.");
      setCancelConfirm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel campaign.");
    } finally {
      setActionLoading(false);
    }
  };

  const statusStyles: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    SENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    SENT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded bg-dnews-border/50 animate-pulse" />
          <div>
            <div className="h-6 w-48 rounded bg-dnews-border/50 animate-pulse" />
            <div className="mt-1 h-4 w-32 rounded bg-dnews-border/50 animate-pulse" />
          </div>
        </div>
        <LoadingState variant="card" rows={3} />
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/newsletter/campaigns"
            className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-gray transition-colors hover:bg-dnews-light-gray"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-heading text-xl font-bold text-dnews-dark">
              Campaign Not Found
            </h2>
          </div>
        </div>
        <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      </div>
    );
  }

  const canEdit = campaign && (campaign.status === "DRAFT" || campaign.status === "SCHEDULED");
  const canSend = isAdmin && campaign && campaign.status === "DRAFT" && campaign.content;
  const canSchedule = isAdmin && campaign && campaign.status === "DRAFT" && campaign.content;
  const canCancel = isAdmin && campaign && (campaign.status === "SCHEDULED" || campaign.status === "DRAFT");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/newsletter/campaigns"
          className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-gray transition-colors hover:bg-dnews-light-gray"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h2 className="font-heading text-xl font-bold text-dnews-dark">
            {campaign?.title}
          </h2>
          <p className="text-sm text-dnews-muted">
            Created by {campaign?.createdBy.firstName} {campaign?.createdBy.lastName}
            {campaign?.updatedBy && ` · Last edited by ${campaign.updatedBy.firstName} ${campaign.updatedBy.lastName}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      {campaign && (
        <>
          <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div>
                  <span className={`inline-block rounded px-2.5 py-1 text-xs font-medium ${statusStyles[campaign.status] || ""}`}>
                    {campaign.status}
                  </span>
                </div>
                {campaign.scheduledAt && (
                  <div className="flex items-center gap-2 text-sm text-dnews-gray">
                    <Clock size={14} />
                    Scheduled for {new Date(campaign.scheduledAt).toLocaleString()}
                  </div>
                )}
                {campaign.sentAt && (
                  <div className="flex items-center gap-2 text-sm text-dnews-gray">
                    <Send size={14} />
                    Sent on {new Date(campaign.sentAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {canEdit && (
                  <Link
                    href={`/dashboard/newsletter/campaigns/${campaign.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-sm border border-dnews-border px-3 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
                  >
                    <Edit size={14} />
                    Edit
                  </Link>
                )}
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-sm border border-dnews-border px-3 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
                >
                  <Eye size={14} />
                  Preview
                </button>
                {canSend && (
                  <button
                    onClick={() => setSendConfirm(true)}
                    className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
                  >
                    <Send size={14} />
                    Send Now
                  </button>
                )}
                {canSchedule && (
                  <button
                    onClick={() => setScheduleOpen(true)}
                    className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
                  >
                    <Clock size={14} />
                    Schedule
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => setCancelConfirm(true)}
                    className="inline-flex items-center gap-2 rounded-sm border border-dnews-red px-3 py-2 text-xs font-medium text-dnews-red transition-colors hover:bg-dnews-red/5"
                  >
                    <Ban size={14} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">Recipients</p>
              <p className="mt-1 font-heading text-2xl font-bold text-dnews-dark">
                {campaign.totalRecipients || campaign._count.recipients || 0}
              </p>
            </div>
            <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">Sent</p>
              <p className="mt-1 font-heading text-2xl font-bold text-green-600">
                {campaign.totalSent}
              </p>
            </div>
            <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">Failed</p>
              <p className="mt-1 font-heading text-2xl font-bold text-dnews-red">
                {campaign.totalFailed}
              </p>
            </div>
          </div>

          <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
            <h3 className="mb-1 text-sm font-semibold text-dnews-dark">Subject Line</h3>
            <p className="text-sm text-dnews-gray">{campaign.subject}</p>
          </div>

          {campaign.excerpt && (
            <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
              <h3 className="mb-1 text-sm font-semibold text-dnews-dark">Excerpt</h3>
              <p className="text-sm italic text-dnews-muted">{campaign.excerpt}</p>
            </div>
          )}

          <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
            <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Content</h3>
            {campaign.content ? (
              <div
                className="prose prose-sm max-w-none text-dnews-dark"
                dangerouslySetInnerHTML={{ __html: campaign.content }}
              />
            ) : (
              <p className="text-sm text-dnews-muted italic">No content yet.</p>
            )}
          </div>

          {campaign.recipients && campaign.recipients.length > 0 && (
            <div className="rounded-sm border border-dnews-border bg-dnews-card p-6">
              <h3 className="mb-3 text-sm font-semibold text-dnews-dark">
                Recipients ({campaign.recipients.length})
              </h3>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-dnews-border text-dnews-muted">
                      <th className="pb-2 pr-2 font-medium">Email</th>
                      <th className="pb-2 pr-2 font-medium">Name</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.recipients.map((r) => (
                      <tr key={r.id} className="border-b border-dnews-border/50 last:border-b-0">
                        <td className="py-2 pr-2 text-dnews-dark">{r.subscriber.email}</td>
                        <td className="py-2 pr-2 text-dnews-muted">{r.subscriber.name || "—"}</td>
                        <td className="py-2">
                          <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            r.status === "SENT"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : r.status === "FAILED"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <CampaignPreview
            campaign={previewOpen ? campaign : null}
            onClose={() => setPreviewOpen(false)}
          />

          <Modal
            open={sendConfirm}
            onClose={() => setSendConfirm(false)}
            title="Send Campaign"
            size="sm"
            footer={
              <>
                <button
                  onClick={() => setSendConfirm(false)}
                  className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
                >
                  <Send size={14} />
                  {actionLoading ? "Sending..." : "Send Now"}
                </button>
              </>
            }
          >
            <p className="text-sm text-dnews-gray">
              Send this campaign to all active subscribers immediately?
            </p>
          </Modal>

          <Modal
            open={scheduleOpen}
            onClose={() => setScheduleOpen(false)}
            title="Schedule Campaign"
            size="sm"
            footer={
              <>
                <button
                  onClick={() => setScheduleOpen(false)}
                  className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
                >
                  <Clock size={14} />
                  {actionLoading ? "Scheduling..." : "Schedule"}
                </button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="text-sm text-dnews-gray">
                Choose when to send this campaign.
              </p>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
                />
              </div>
            </div>
          </Modal>

          <Modal
            open={cancelConfirm}
            onClose={() => setCancelConfirm(false)}
            title="Cancel Campaign"
            size="sm"
            footer={
              <>
                <button
                  onClick={() => setCancelConfirm(false)}
                  className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
                >
                  Close
                </button>
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex items-center gap-2 rounded-sm bg-dnews-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-red/80 disabled:opacity-60"
                >
                  <Ban size={14} />
                  {actionLoading ? "Cancelling..." : "Cancel Campaign"}
                </button>
              </>
            }
          >
            <p className="text-sm text-dnews-gray">
              Are you sure you want to cancel this campaign? This cannot be undone.
            </p>
          </Modal>
        </>
      )}
    </div>
  );
}
