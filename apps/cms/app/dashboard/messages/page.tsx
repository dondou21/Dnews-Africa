"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { MailOpen, Trash2, Eye } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Modal from "@/components/dashboard/Modal";
import { get, patch, del } from "@dnews/api-client";
import RoleGuard from "@/components/dashboard/RoleGuard";
import type { ContactMessage } from "@dnews/types";

export default function MessagesPage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <MessagesPageContent />
    </RoleGuard>
  );
}

function MessagesPageContent() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get<ContactMessage[]>("/contact/messages");
      setMessages(data);
    } catch {
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const markAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      await patch(`/contact/messages/${id}/read`, {});
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
      );
      setSuccess("Message marked as read.");
    } catch {
      setError("Failed to mark message as read.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/contact/messages/${deleteTarget.id}`);
      setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setSuccess("Message deleted successfully.");
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete message.");
    } finally {
      setDeleting(false);
    }
  };

  const previewMessage = (content: string, max = 120): string => {
    const stripped = content.replace(/<[^>]+>/g, "");
    if (stripped.length <= max) return stripped;
    return stripped.slice(0, max) + "...";
  };

  const columns: Column<ContactMessage>[] = [
    {
      key: "sender",
      header: "Sender",
      render: (m) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-dnews-dark">{m.name}</p>
          <p className="text-xs text-dnews-muted">{m.email}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (m) => (
        <span
          className={`text-sm ${
            !m.isRead
              ? "font-semibold text-dnews-dark"
              : "text-dnews-gray"
          }`}
        >
          {m.subject}
        </span>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (m) => (
        <p className="max-w-xs text-sm text-dnews-gray">
          {previewMessage(m.message)}
        </p>
      ),
    },
    {
      key: "isRead",
      header: "Status",
      render: (m) => (
        <StatusBadge
          status={m.isRead ? "read" : "unread"}
        />
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (m) => (
        <span className="whitespace-nowrap text-xs text-dnews-muted">
          {new Date(m.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (m) => {
        const busy = actionLoading === m.id;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMessage(m)}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
              title="View message"
            >
              <Eye size={14} />
            </button>
            {!m.isRead && (
              <button
                onClick={() => markAsRead(m.id)}
                disabled={busy}
                className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-blue-100 hover:text-blue-700 disabled:opacity-40"
                title="Mark as read"
              >
                <MailOpen size={14} />
              </button>
            )}
            <button
              onClick={() => setDeleteTarget(m)}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.isRead).length,
    [messages]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">
            Contact Messages
          </h2>
          <p className="mt-1 text-sm text-dnews-muted">
            Read and manage messages from your contact form.
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-dnews-red/10 px-2 py-0.5 text-xs font-medium text-dnews-red">
                {unreadCount} unread
              </span>
            )}
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
          <p className="text-xs font-medium text-green-700 dark:text-green-400">
            {success}
          </p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={messages}
        keyExtractor={(m) => m.id}
        loading={loading}
        emptyTitle="No messages"
        emptyDescription="No contact form messages have been received yet."
      />

      <Modal
        open={!!viewMessage}
        onClose={() => setViewMessage(null)}
        title={viewMessage?.subject || "Message"}
        size="lg"
      >
        {viewMessage && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rounded-sm bg-dnews-light-gray p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">
                  Name
                </p>
                <p className="mt-0.5 text-sm font-medium text-dnews-dark">
                  {viewMessage.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">
                  Email
                </p>
                <p className="mt-0.5 text-sm text-dnews-accent">
                  {viewMessage.email}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">
                  Date
                </p>
                <p className="mt-0.5 text-sm text-dnews-gray">
                  {new Date(viewMessage.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">
                  Status
                </p>
                <p className="mt-0.5">
                  <StatusBadge
                    status={viewMessage.isRead ? "read" : "unread"}
                  />
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">
                Subject
              </p>
              <p className="mt-0.5 text-base font-semibold text-dnews-dark">
                {viewMessage.subject}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">
                Message
              </p>
              <div className="mt-1 whitespace-pre-wrap rounded-sm border border-dnews-border bg-white p-4 text-sm leading-relaxed text-dnews-gray dark:bg-dnews-dark-gray dark:text-white">
                {viewMessage.message}
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          {!viewMessage?.isRead && (
            <button
              onClick={() => {
                if (viewMessage) markAsRead(viewMessage.id);
                setViewMessage(null);
              }}
              className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent/80"
            >
              <MailOpen size={14} />
              Mark as Read
            </button>
          )}
          <button
            onClick={() => setViewMessage(null)}
            className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
          >
            Close
          </button>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Message"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-sm bg-dnews-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-red/80 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        <p className="text-sm text-dnews-gray">
          Are you sure you want to delete this message from{" "}
          <span className="font-medium text-dnews-dark">
            {deleteTarget?.name}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
