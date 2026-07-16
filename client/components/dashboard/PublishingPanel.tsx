"use client";

import { useMemo } from "react";
import { Calendar, Globe, Star, Zap, MessageCircle } from "lucide-react";

function getTomorrowDateString() {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

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
  const minDate = useMemo(() => getTomorrowDateString(), []);

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
                onScheduleToggle(true);
                onStatusChange("DRAFT");
              } else {
                onScheduleToggle(false);
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
                onChange={(e) => onScheduledAtChange(e.target.value)}
                className="w-full rounded-sm border border-dnews-border bg-dnews-card px-2.5 py-1.5 text-xs text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
              />
              <div className="flex items-center gap-1 text-[10px] text-dnews-muted">
                <Globe size={10} />
                <span>Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
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
