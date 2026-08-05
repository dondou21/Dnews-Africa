"use client";

import { useEffect, useState } from "react";
import { get } from "@dnews/api-client";
import type { Sponsor } from "@dnews/types";

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-dnews-gray dark:text-white/60">
        {sponsor.name}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sponsor.logoUrl}
      alt={sponsor.altText || sponsor.name}
      width={140}
      height={44}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className="h-9 w-auto max-w-[140px] object-contain opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:h-10"
    />
  );
}

export default function SponsorsBar() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    let cancelled = false;
    get<Sponsor[]>("/sponsors")
      .then((data) => {
        if (!cancelled) setSponsors(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setSponsors([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (sponsors.length === 0) return null;

  return (
    <div className="border-b border-dnews-border bg-dnews-light-gray dark:bg-white/5">
      <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-4 py-2">
        <span className="shrink-0 text-[9px] font-semibold uppercase tracking-[0.15em] text-dnews-muted dark:text-white/50">
          Sponsored by
        </span>
        <div className="flex flex-1 items-center gap-6 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
              title={sponsor.name}
            >
              <SponsorLogo sponsor={sponsor} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
