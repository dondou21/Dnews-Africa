"use client";

import { Search, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { SeoAnalysisResult } from "@/types/seo";

interface SeoAnalyzerProps {
  analysis: SeoAnalysisResult | null;
  loading?: boolean;
}

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-xs text-dnews-gray">{label}</span>
      <div className="flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-medium text-dnews-dark">{score}/{max}</span>
    </div>
  );
}

export default function SeoAnalyzer({ analysis, loading }: SeoAnalyzerProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3 rounded-sm border border-dnews-border bg-dnews-card p-4">
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-sm border border-dnews-border bg-dnews-card p-6 text-center">
        <Search size={24} className="mx-auto text-dnews-muted" />
        <p className="mt-2 text-sm text-dnews-muted">Fill in the SEO fields to see analysis.</p>
      </div>
    );
  }

  const gradeColor = analysis.grade === "excellent" ? "text-green-600" : analysis.grade === "needs_improvement" ? "text-amber-600" : "text-red-600";
  const gradeBg = analysis.grade === "excellent" ? "bg-green-50 dark:bg-green-900/20" : analysis.grade === "needs_improvement" ? "bg-amber-50 dark:bg-amber-900/20" : "bg-red-50 dark:bg-red-900/20";

  return (
    <div className="space-y-4 rounded-sm border border-dnews-border bg-dnews-card p-4">
      <div className={`flex items-center justify-between rounded-sm p-4 ${gradeBg}`}>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">SEO Score</p>
          <p className={`text-3xl font-bold ${gradeColor}`}>{analysis.score}</p>
          <p className="text-xs capitalize text-dnews-muted">{analysis.grade.replace(/_/g, " ")}</p>
        </div>
        <div className="relative h-20 w-20">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
            <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" stroke={analysis.score >= 80 ? "#22c55e" : analysis.score >= 50 ? "#f59e0b" : "#ef4444"} strokeDasharray={`${(analysis.score / 100) * 96.5} 96.5`} strokeLinecap="round" />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${gradeColor}`}>{analysis.score}</span>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(analysis.details).map(([key, val]) => (
          <ScoreBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} score={val.score} max={val.max} />
        ))}
      </div>

      {analysis.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-dnews-gray">Suggestions</p>
          <ul className="space-y-1">
            {analysis.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-dnews-gray">
                {s.includes("Missing") ? <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-500" /> : <Info size={12} className="mt-0.5 shrink-0 text-dnews-accent" />}
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
