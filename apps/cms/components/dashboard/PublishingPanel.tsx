"use client";

import { useMemo } from "react";
import { Calendar, Globe, Star, Zap, MessageCircle, AlertCircle, Clock } from "lucide-react";

function getTodayDateString() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
}

function formatScheduleDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

interface PublishingPanelProps {
  status: string;
  onStatusChange: (status: string) => void;
  scheduleEnabled: boolean;
  onScheduleToggle: (enabled: boolean) => void;
  scheduledAt: string;
  onScheduledAtChange: (val: string) => void;
  isFeatured: boolean;
  onFeaturedChange: (val: boolean) => void;
  isBreaking?: boolean;
  onBreakingChange?: (val: boolean) => void;
  allowComments?: boolean;
  onAllowCommentsChange?: (val: boolean) => void;
  isJournalist: boolean;
  articleStatus?: string;
  showBreaking?: boolean;
  showComments?: boolean;
}

function isPastDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const selected = new Date(dateStr);
  const now = new Date();
  now.setSeconds(0, 0);
  return selected < now;
}

export default function PublishingPanel({
  status,
  onStatusChange,
  scheduleEnabled,
  onScheduleToggle,
  scheduledAt,
  onScheduledAtChange,
  isFeatured,
  onFeaturedChange,
  isBreaking,
  onBreakingChange,
  allowComments,
  onAllowCommentsChange,
  isJournalist,
  articleStatus,
  showBreaking = true,
  showComments = true,
}: PublishingPanelProps) {
  const canEdit = !isJournalist || !articleStatus || articleStatus === "DRAFT" || articleStatus === "IDEA" || articleStatus === "NEEDS_REVISION";
  const todayStr = useMemo(() => getTodayDateString(), []);
  const minDate = todayStr;

  const handleScheduleToggle = (enabled: boolean) => {
    onScheduleToggle(enabled);
    if (enabled && !scheduledAt) {
      onScheduledAtChange(todayStr);
    }
  };

  const handleScheduledAtChange = (val: string) => {
    onScheduledAtChange(val);
  };

  const scheduleError = useMemo(() => {
    if (!scheduleEnabled || !scheduledAt) return null;
    if (isPastDate(scheduledAt)) return "The selected date and time is in the past. Please select a future date or time.";
    return null;
  }, [scheduleEnabled, scheduledAt]);

  const scheduleDisplay = useMemo(() => {
    if (!scheduleEnabled || !scheduledAt || scheduleError) return null;
    return formatScheduleDisplay(scheduledAt);
  }, [scheduleEnabled, scheduledAt, scheduleError]);

  return (
    <div className="rounded-sm border border-dnews-border bg-dnews-card">
      <div className="border-b border-dnews-border px-4 py-3">
        <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-dnews-dark">
          Publishing
        </h3>
      </div>

      <div className="space-y-5 p-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-dnews-gray">
            Status
          </label>
          <select
            value={scheduleEnabled ? "SCHEDULED" : status}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "SCHEDULED") {
                handleScheduleToggle(true);
                onStatusChange("DRAFT");
              } else {
                handleScheduleToggle(false);
                onStatusChange(val);
              }
            }}
            disabled={!canEdit}
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-xs font-medium text-dnews-dark outline-none transition-colors focus:border-dnews-accent disabled:opacity-50"
          >
            <option value="DRAFT">Draft</option>
            {!isJournalist && <option value="PUBLISHED">Published</option>}
            <option value="SCHEDULED">Scheduled</option>
            {!isJournalist && <option value="ARCHIVED">Archived</option>}
          </select>
        </div>

        {scheduleEnabled && (
          <div className="rounded-sm border border-dnews-border bg-dnews-bg p-3">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dnews-gray">
              <Calendar size={12} />
              <span>Schedule</span>
            </div>
            <div className="space-y-2">
              <input
                type="datetime-local"
                value={scheduledAt}
                min={minDate}
                onChange={(e) => handleScheduledAtChange(e.target.value)}
                className="w-full rounded-sm border border-dnews-border bg-dnews-card px-2.5 py-1.5 text-xs text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
              />
              {scheduleError && (
                <div className="flex items-start gap-1.5 rounded-sm border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[10px] text-amber-800">
                  <AlertCircle size={11} className="mt-0.5 shrink-0 text-amber-500" />
                  <span>{scheduleError}</span>
                </div>
              )}
              {scheduleDisplay && (
                <div className="flex items-center gap-1.5 rounded-sm border border-dnews-border/50 bg-dnews-card px-2.5 py-1.5 text-[10px] text-dnews-dark">
                  <Clock size={10} className="shrink-0 text-dnews-muted" />
                  <span className="font-medium">{scheduleDisplay}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[10px] text-dnews-muted">
                <Globe size={10} />
                <span>Timezone: {TIMEZONE}</span>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-dnews-border pt-4">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-dnews-gray">
            Promotion
          </label>
          <div className="space-y-2.5">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => onFeaturedChange(e.target.checked)}
                disabled={isJournalist}
                className="h-3.5 w-3.5 accent-dnews-accent"
              />
              <Star size={12} className="text-dnews-muted" />
              <span className="text-xs text-dnews-dark">Feature this article</span>
            </label>

            {showBreaking && (
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={isBreaking ?? false}
                  onChange={(e) => onBreakingChange?.(e.target.checked)}
                  disabled={isJournalist}
                  className="h-3.5 w-3.5 accent-dnews-accent"
                />
                <Zap size={12} className="text-dnews-muted" />
                <span className="text-xs text-dnews-dark">Mark as Breaking News</span>
              </label>
            )}

            {showComments && (
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={allowComments ?? true}
                  onChange={(e) => onAllowCommentsChange?.(e.target.checked)}
                  className="h-3.5 w-3.5 accent-dnews-accent"
                />
                <MessageCircle size={12} className="text-dnews-muted" />
                <span className="text-xs text-dnews-dark">Allow Comments</span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
