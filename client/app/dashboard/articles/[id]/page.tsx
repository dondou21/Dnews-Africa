"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Send, CheckCircle, XCircle, AlertTriangle, Calendar,
  Clock, Archive, RotateCcw, MessageSquare, GitBranch, History,
  UserCheck, ExternalLink, Edit, ThumbsUp,
} from "lucide-react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import LoadingState from "@/components/dashboard/LoadingState";
import Modal from "@/components/dashboard/Modal";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get, post, patch } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import type { WorkflowArticleResponse, EditorialComment, ArticleRevision, EditorialApproval, ArticleAuditLog } from "@/types/editorial";
import type { Article } from "@/types/article";

export default function ArticleDetailPage() {
  return (<RoleGuard roles={["Admin", "Editor", "Journalist", "Moderator"]}><ArticleDetailContent /></RoleGuard>);
}

function ArticleDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<WorkflowArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "comments" | "revisions" | "approvals" | "audit">("overview");
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState<{ type: string; title: string; message: string } | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    get<WorkflowArticleResponse>(`/editorial/articles/${id}/workflow`)
      .then(setData)
      .catch(() => setError("Failed to load article."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); }
  }, [success]);

  const article = data?.article;
  const isJournalist = user?.role.name === "Journalist";
  const isEditor = user?.role.name === "Admin" || user?.role.name === "Editor";
  const isModerator = user?.role.name === "Moderator";
  const isAuthor = article?.authorId === user?.id;

  const canSubmit = isAuthor && (article?.status === "DRAFT" || article?.status === "IDEA");
  const canApprove = isEditor && article?.status === "IN_REVIEW";
  const canRequestChanges = isEditor && (article?.status === "IN_REVIEW");
  const canReject = isEditor && (article?.status === "IN_REVIEW" || article?.status === "NEEDS_REVISION");
  const canSchedule = isEditor && article?.status === "APPROVED";
  const canPublish = isEditor && (article?.status === "APPROVED" || article?.status === "SCHEDULED");
  const canArchive = isEditor && article?.status === "PUBLISHED";
  const canRestore = article?.status === "ARCHIVED" || article?.status === "REJECTED";
  const canRevise = isAuthor && article?.status === "NEEDS_REVISION";

  const doAction = async (action: string) => {
    setActionLoading(true);
    setError(""); setSuccess("");
    try {
      let res;
      switch (action) {
        case "submit":
          res = await post(`/editorial/articles/${id}/submit`, { changeReason: actionNotes || undefined });
          break;
        case "approve":
          res = await post(`/editorial/articles/${id}/approve`, { notes: actionNotes || undefined });
          break;
        case "request-changes":
          res = await post(`/editorial/articles/${id}/request-changes`, { notes: actionNotes || undefined });
          break;
        case "reject":
          res = await post(`/editorial/articles/${id}/reject`, { notes: actionNotes || undefined });
          break;
        case "publish":
          res = await post(`/editorial/articles/${id}/publish`, {});
          break;
        case "archive":
          res = await post(`/editorial/articles/${id}/archive`, {});
          break;
        case "restore":
          res = await post(`/editorial/articles/${id}/restore`, { changeReason: actionNotes || undefined });
          break;
        case "schedule":
          const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
          res = await post(`/editorial/articles/${id}/schedule`, { scheduledAt });
          break;
      }
      setSuccess(`Article ${action.replace(/-/g, " ")}d successfully.`);
      setActionModal(null);
      setActionNotes("");
      if (data) {
        const refreshed = await get<WorkflowArticleResponse>(`/editorial/articles/${id}/workflow`);
        setData(refreshed);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Failed to ${action}.`);
    } finally { setActionLoading(false); }
  };

  const submitComment = async (e: FormEvent) => {
    e.preventDefault(); if (!commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      await post(`/editorial/articles/${id}/comments`, { comment: commentText });
      setCommentText("");
      const refreshed = await get<WorkflowArticleResponse>(`/editorial/articles/${id}/workflow`);
      setData(refreshed);
    } catch { setError("Failed to post comment."); } finally { setCommentSubmitting(false); }
  };

  if (loading) return <LoadingState variant="card" rows={4} />;
  if (error && !data) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-dnews-red">{error}</p>
      <button onClick={() => router.back()} className="mt-4 text-sm text-dnews-accent hover:underline">&larr; Go back</button>
    </div>
  );
  if (!article) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-dnews-muted hover:text-dnews-accent">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-xl font-bold text-dnews-dark">{article.title}</h2>
            <StatusBadge status={article.status} />
          </div>
          <p className="mt-1 text-sm text-dnews-muted">
            by {article.author.firstName} {article.author.lastName} &middot; {article.category.name}
            {article.assignedEditor && <span> &middot; Editor: {article.assignedEditor.firstName} {article.assignedEditor.lastName}</span>}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {article.status === "PUBLISHED" && (
            <Link href={`/articles/${article.slug}`} target="_blank" className="inline-flex items-center gap-1 rounded-sm border border-dnews-border px-3 py-1.5 text-xs font-medium text-dnews-gray hover:bg-dnews-light-gray">
              <ExternalLink size={12} /> View
            </Link>
          )}
          {!isModerator && (
            <Link href={`/dashboard/articles/${id}/edit`} className="inline-flex items-center gap-1 rounded-sm border border-dnews-border px-3 py-1.5 text-xs font-medium text-dnews-gray hover:bg-dnews-light-gray">
              <Edit size={12} /> Edit
            </Link>
          )}
        </div>
      </div>

      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}
      {success && <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20"><p className="text-xs font-medium text-green-700 dark:text-green-400">{success}</p></div>}

      <div className="flex flex-wrap gap-2">
        {canSubmit && (
          <button onClick={() => setActionModal({ type: "submit", title: "Submit for Review", message: "Submit this article for editorial review?" })} className="inline-flex items-center gap-1 rounded-sm bg-dnews-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-dnews-accent/90">
            <Send size={12} /> Submit for Review
          </button>
        )}
        {canRevise && (
          <button onClick={() => doAction("submit")} className="inline-flex items-center gap-1 rounded-sm bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">
            <RotateCcw size={12} /> Resubmit
          </button>
        )}
        {canApprove && (
          <button onClick={() => setActionModal({ type: "approve", title: "Approve Article", message: "Approve this article?" })} className="inline-flex items-center gap-1 rounded-sm bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
            <ThumbsUp size={12} /> Approve
          </button>
        )}
        {canRequestChanges && (
          <button onClick={() => setActionModal({ type: "request-changes", title: "Request Changes", message: "Request changes to this article." })} className="inline-flex items-center gap-1 rounded-sm bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">
            <AlertTriangle size={12} /> Request Changes
          </button>
        )}
        {canReject && (
          <button onClick={() => setActionModal({ type: "reject", title: "Reject Article", message: "Are you sure you want to reject this article?" })} className="inline-flex items-center gap-1 rounded-sm bg-dnews-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-dnews-red/90">
            <XCircle size={12} /> Reject
          </button>
        )}
        {canSchedule && (
          <button onClick={() => setActionModal({ type: "schedule", title: "Schedule Publication", message: "" })} className="inline-flex items-center gap-1 rounded-sm bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
            <Calendar size={12} /> Schedule
          </button>
        )}
        {canPublish && (
          <button onClick={() => setActionModal({ type: "publish", title: "Publish Now", message: "Publish this article immediately?" })} className="inline-flex items-center gap-1 rounded-sm bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
            <Clock size={12} /> Publish Now
          </button>
        )}
        {canArchive && (
          <button onClick={() => setActionModal({ type: "archive", title: "Archive Article", message: "Archive this article?" })} className="inline-flex items-center gap-1 rounded-sm bg-gray-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700">
            <Archive size={12} /> Archive
          </button>
        )}
        {canRestore && (
          <button onClick={() => setActionModal({ type: "restore", title: "Restore Article", message: "Restore this article to Draft status?" })} className="inline-flex items-center gap-1 rounded-sm border border-dnews-border px-3 py-1.5 text-xs font-medium text-dnews-gray hover:bg-dnews-light-gray">
            <RotateCcw size={12} /> Restore to Draft
          </button>
        )}
      </div>

      <div className="rounded-sm border border-dnews-border">
        <div className="flex border-b border-dnews-border">
          {[
            { key: "overview", label: "Overview", icon: History },
            { key: "comments", label: `Comments (${data?.comments?.length ?? 0})`, icon: MessageSquare },
            { key: "revisions", label: `Revisions (${data?.revisions?.length ?? 0})`, icon: GitBranch },
            { key: "approvals", label: `Approvals (${data?.approvals?.length ?? 0})`, icon: CheckCircle },
            { key: "audit", label: "Audit Log", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
                  isActive ? "border-dnews-accent text-dnews-accent" : "border-transparent text-dnews-gray hover:text-dnews-dark"
                }`}>
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-sm border border-dnews-border bg-dnews-bg p-4">
                  <p className="text-xs font-medium text-dnews-muted uppercase tracking-wider">Status</p>
                  <div className="mt-1"><StatusBadge status={article.status} /></div>
                </div>
                <div className="rounded-sm border border-dnews-border bg-dnews-bg p-4">
                  <p className="text-xs font-medium text-dnews-muted uppercase tracking-wider">Submitted</p>
                  <p className="mt-1 text-sm text-dnews-dark">{article.submittedAt ? new Date(article.submittedAt).toLocaleString() : "—"}</p>
                </div>
                <div className="rounded-sm border border-dnews-border bg-dnews-bg p-4">
                  <p className="text-xs font-medium text-dnews-muted uppercase tracking-wider">Published</p>
                  <p className="mt-1 text-sm text-dnews-dark">{article.publishedAt ? new Date(article.publishedAt).toLocaleString() : "—"}</p>
                </div>
              </div>
              {article.changeReason && (
                <div className="rounded-sm border border-dnews-border bg-dnews-bg p-4">
                  <p className="text-xs font-medium text-dnews-muted uppercase tracking-wider">Change Reason</p>
                  <p className="mt-1 text-sm text-dnews-dark">{article.changeReason}</p>
                </div>
              )}
              <div className="rounded-sm border border-dnews-border bg-dnews-bg p-4">
                <p className="text-xs font-medium text-dnews-muted uppercase tracking-wider">Summary</p>
                <p className="mt-1 text-sm text-dnews-dark">{article.summary}</p>
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              {!isModerator && (
                <form onSubmit={submitComment} className="flex gap-2">
                  <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
                  <button type="submit" disabled={commentSubmitting || !commentText.trim()} className="rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
                    {commentSubmitting ? "..." : "Send"}
                  </button>
                </form>
              )}
              <div className="space-y-3">
                {(!data?.comments || data.comments.length === 0) && (
                  <p className="py-8 text-center text-sm text-dnews-muted">No comments yet.</p>
                )}
                {data?.comments.map((c) => (
                  <div key={c.id} className={`rounded-sm border p-4 ${c.resolved ? "border-green-200 bg-green-50/50" : "border-dnews-border"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-dnews-dark">{c.user.firstName} {c.user.lastName}</span>
                        {c.user.role && <span className="text-xs text-dnews-muted">({c.user.role.name})</span>}
                        <span className="text-xs text-dnews-muted">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      {c.resolved && <span className="text-xs font-medium text-green-600">Resolved</span>}
                    </div>
                    <p className="mt-2 text-sm text-dnews-gray">{c.comment}</p>
                    {c.sectionReference && <p className="mt-1 text-xs text-dnews-accent">Section: {c.sectionReference}</p>}
                    {c.replies?.map((r) => (
                      <div key={r.id} className="ml-6 mt-3 border-l-2 border-dnews-border pl-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-dnews-dark">{r.user.firstName} {r.user.lastName}</span>
                          <span className="text-xs text-dnews-muted">{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-sm text-dnews-gray">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "revisions" && (
            <div className="space-y-3">
              {(!data?.revisions || data.revisions.length === 0) && (
                <p className="py-8 text-center text-sm text-dnews-muted">No revisions saved yet.</p>
              )}
              {data?.revisions.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-sm border border-dnews-border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dnews-accent/10 text-xs font-bold text-dnews-accent">v{r.version}</div>
                    <div>
                      <p className="text-sm font-medium text-dnews-dark">{r.title}</p>
                      <p className="text-xs text-dnews-muted">
                        {r.changedBy.firstName} {r.changedBy.lastName} &middot; {new Date(r.createdAt).toLocaleString()}
                        {r.changeReason && <span> &middot; {r.changeReason}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "approvals" && (
            <div className="space-y-3">
              {(!data?.approvals || data.approvals.length === 0) && (
                <p className="py-8 text-center text-sm text-dnews-muted">No approvals recorded yet.</p>
              )}
              {data?.approvals.map((a) => (
                <div key={a.id} className="flex items-start gap-4 rounded-sm border border-dnews-border p-4">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    a.decision === "APPROVED" ? "bg-green-100 text-green-600" :
                    a.decision === "REJECTED" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                  }`}>
                    {a.decision === "APPROVED" ? <CheckCircle size={16} /> : a.decision === "REJECTED" ? <XCircle size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-dnews-dark">{a.reviewer.firstName} {a.reviewer.lastName}</span>
                      <StatusBadge status={a.decision} />
                      <span className="text-xs text-dnews-muted">{new Date(a.createdAt).toLocaleString()}</span>
                    </div>
                    {a.notes && <p className="mt-1 text-sm text-dnews-gray">{a.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-1">
              {(!data?.auditLogs || data.auditLogs.length === 0) && (
                <p className="py-8 text-center text-sm text-dnews-muted">No audit log entries.</p>
              )}
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 h-full w-px bg-dnews-border" />
                {data?.auditLogs.map((log) => (
                  <div key={log.id} className="relative pb-4 last:pb-0">
                    <div className="absolute -left-5 mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-dnews-accent bg-dnews-card" />
                    <div className="rounded-sm bg-dnews-bg p-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold uppercase ${
                          log.action === "PUBLISHED" ? "text-green-600" :
                          log.action === "REJECTED" ? "text-red-600" :
                          log.action === "SUBMITTED" ? "text-amber-600" :
                          "text-dnews-accent"
                        }`}>{log.action.replace(/_/g, " ")}</span>
                        <span className="text-xs text-dnews-muted">by {log.user.firstName} {log.user.lastName}</span>
                        <span className="text-xs text-dnews-muted">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      {log.fromStatus && log.toStatus && (
                        <p className="mt-1 text-xs text-dnews-gray">{log.fromStatus.replace(/_/g, " ")} &rarr; {log.toStatus.replace(/_/g, " ")}</p>
                      )}
                      {log.description && <p className="mt-1 text-xs text-dnews-muted">{log.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={!!actionModal} onClose={() => { setActionModal(null); setActionNotes(""); setScheduleDate(""); setScheduleTime(""); }}
        title={actionModal?.title ?? ""} size="sm"
        footer={
          actionModal?.type === "schedule" ? undefined : (
            <>
              <button onClick={() => { setActionModal(null); setActionNotes(""); }} className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray">Cancel</button>
              <button onClick={() => actionModal && doAction(actionModal.type)} disabled={actionLoading} className="rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">
                {actionLoading ? "Processing..." : "Confirm"}
              </button>
            </>
          )
        }>
        {actionModal?.type === "schedule" ? (
          <div className="space-y-4">
            <p className="text-sm text-dnews-gray">Set the publication schedule.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Date</label>
                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Time</label>
                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setActionModal(null); setScheduleDate(""); setScheduleTime(""); }} className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray">Cancel</button>
              <button onClick={() => doAction("schedule")} disabled={actionLoading || !scheduleDate || !scheduleTime} className="rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">
                {actionLoading ? "Scheduling..." : "Schedule"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-dnews-gray">{actionModal?.message}</p>
            {(actionModal?.type === "submit" || actionModal?.type === "request-changes" || actionModal?.type === "reject" || actionModal?.type === "restore") && (
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Notes</label>
                <textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} rows={3} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" placeholder={actionModal?.type === "request-changes" ? "Describe what changes are needed..." : actionModal?.type === "reject" ? "Explain why..." : "Optional notes..."} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
