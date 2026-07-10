"use client";

import Modal from "@/components/dashboard/Modal";
import type { Campaign } from "@/types/campaign";

interface CampaignPreviewProps {
  campaign: Campaign | null;
  onClose: () => void;
}

export default function CampaignPreview({ campaign, onClose }: CampaignPreviewProps) {
  if (!campaign) return null;

  return (
    <Modal
      open={!!campaign}
      onClose={onClose}
      title={`Preview: ${campaign.title}`}
      size="lg"
    >
      <div className="space-y-4">
        {campaign.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.featuredImage}
            alt=""
            className="w-full rounded-sm object-cover max-h-48"
          />
        )}
        <div>
          <h3 className="text-lg font-semibold text-dnews-dark">
            {campaign.subject}
          </h3>
          {campaign.excerpt && (
            <p className="mt-1 text-sm italic text-dnews-muted">
              {campaign.excerpt}
            </p>
          )}
        </div>
        <div className="rounded-sm border border-dnews-border bg-dnews-bg p-4">
          <div
            className="prose prose-sm max-w-none text-dnews-dark [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm"
            dangerouslySetInnerHTML={{ __html: campaign.content }}
          />
        </div>
        <div className="border-t border-dnews-border pt-4 text-center">
          <p className="text-xs text-dnews-muted">
            Status: {campaign.status}
            {campaign.scheduledAt && ` | Scheduled: ${new Date(campaign.scheduledAt).toLocaleString()}`}
            {campaign.sentAt && ` | Sent: ${new Date(campaign.sentAt).toLocaleString()}`}
          </p>
          <p className="mt-1 text-xs text-dnews-muted">
            Recipients: {campaign.totalRecipients || campaign._count.recipients}
            {campaign.totalSent > 0 && ` | Sent: ${campaign.totalSent}`}
            {campaign.totalFailed > 0 && ` | Failed: ${campaign.totalFailed}`}
          </p>
        </div>
      </div>
    </Modal>
  );
}
