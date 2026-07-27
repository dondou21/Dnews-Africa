"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Clock, ExternalLink } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Pagination from "@/components/dashboard/Pagination";
import LoadingState from "@/components/dashboard/LoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get } from "@dnews/api-client";

interface Delivery {
  id: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  articlePublishedAt: string | null;
  articleStatus: string;
  status: string;
  totalRecipients: number;
  totalSent: number;
  totalFailed: number;
  sentAt: string | null;
  lastAttemptAt: string | null;
  createdAt: string;
  deliveryPercentage: number;
}

interface DeliveryResponse {
  data: Delivery[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

const statusFilters = [
  { label: "All", value: "ALL" },
  { label: "Sent", value: "SENT" },
  { label: "Partial", value: "PARTIAL" },
  { label: "Failed", value: "FAILED" },
  { label: "Sending", value: "SENDING" },
  { label: "Pending", value: "PENDING" },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function StatusCell({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    SENT: { label: "Sent", className: "bg-green-100 text-green-700" },
    PARTIAL: { label: "Partial", className: "bg-amber-100 text-amber-700" },
    FAILED: { label: "Failed", className: "bg-red-100 text-red-700" },
    SENDING: { label: "Sending", className: "bg-blue-100 text-blue-700" },
    PENDING: { label: "Pending", className: "bg-gray-100 text-gray-600" },
  };
  const v = variants[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return <span className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${v.className}`}>{v.label}</span>;
}

export default function DeliveriesPage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <DeliveriesContent />
    </RoleGuard>
  );
}

function DeliveriesContent() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const result = await get<DeliveryResponse>(`/articles/newsletter/deliveries?${params}`);
      setDeliveries(Array.isArray(result?.data) ? result.data : []);
      setPagination(result?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch {
      setError("Failed to load deliveries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, statusFilter]);

  function handleSearch() { setPage(1); load(); }

  const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];

  const columns: Column<Delivery>[] = [
    {
      key: "articleTitle",
      header: "Article",
      render: (row) => (
        <Link href={`/dashboard/articles/${row.articleId}/edit`} className="font-medium text-dnews-dark hover:text-dnews-accent transition-colors">
          {row.articleTitle}
        </Link>
      ),
    },
    {
      key: "articlePublishedAt",
      header: "Published",
      render: (row) => <span className="text-xs text-dnews-muted">{formatDate(row.articlePublishedAt)}</span>,
    },
    {
      key: "status",
      header: "Delivery",
      render: (row) => <StatusCell status={row.status} />,
    },
    {
      key: "totalRecipients",
      header: "Recipients",
      render: (row) => <span className="text-xs font-medium">{row.totalRecipients.toLocaleString()}</span>,
    },
    {
      key: "totalSent",
      header: "Sent",
      render: (row) => <span className="text-xs text-green-600 font-medium">{row.totalSent.toLocaleString()}</span>,
    },
    {
      key: "totalFailed",
      header: "Failed",
      render: (row) => <span className={`text-xs font-medium ${row.totalFailed > 0 ? "text-red-600" : "text-dnews-muted"}`}>{row.totalFailed.toLocaleString()}</span>,
    },
    {
      key: "deliveryPercentage",
      header: "Rate",
      render: (row) => {
        const color = row.deliveryPercentage >= 95 ? "text-green-600" : row.deliveryPercentage >= 50 ? "text-amber-600" : "text-red-600";
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded-full bg-gray-200">
              <div className={`h-full rounded-full ${row.deliveryPercentage >= 95 ? "bg-green-500" : row.deliveryPercentage >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${row.deliveryPercentage}%` }} />
            </div>
            <span className={`text-xs font-medium ${color}`}>{row.deliveryPercentage}%</span>
          </div>
        );
      },
    },
    {
      key: "lastAttemptAt",
      header: "Last Attempt",
      render: (row) => <span className="text-xs text-dnews-muted">{formatDate(row.lastAttemptAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Link
          href={`/dashboard/articles/${row.articleId}/edit`}
          className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-dnews-accent hover:text-dnews-accent-light transition-colors"
        >
          <ExternalLink size={11} />
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">Newsletter Deliveries</h2>
        <p className="mt-1 text-sm text-dnews-muted">Monitor article newsletter delivery status and history.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dnews-muted" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg py-1.5 pl-8 pr-3 text-xs text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
          />
        </div>
        <div className="flex gap-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`rounded-sm px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === f.value
                  ? "bg-dnews-accent text-white"
                  : "bg-dnews-bg text-dnews-muted hover:text-dnews-dark border border-dnews-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState variant="card" rows={5} />
      ) : error ? (
        <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      ) : safeDeliveries.length === 0 ? (
        <EmptyState icon={Clock} title="No deliveries yet" description="Newsletter deliveries will appear here after articles are published." />
      ) : (
        <>
          <DataTable columns={columns} data={safeDeliveries} keyExtractor={(d) => d.id} />
          {pagination?.totalPages > 1 && (
            <Pagination
              page={pagination?.page ?? 1}
              totalPages={pagination?.totalPages ?? 1}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
