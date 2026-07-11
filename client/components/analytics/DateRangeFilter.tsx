"use client";

import { useState } from "react";

interface DateRangeFilterProps {
  value: string;
  onChange: (period: string) => void;
  onCustomRange?: (start: string, end: string) => void;
}

const periods = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "1y", label: "1 Year" },
  { value: "custom", label: "Custom" },
];

export default function DateRangeFilter({ value, onChange, onCustomRange }: DateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(value === "custom");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handlePeriodClick = (p: string) => {
    onChange(p);
    setShowCustom(p === "custom");
  };

  const handleCustomApply = () => {
    if (startDate && endDate && onCustomRange) {
      onCustomRange(startDate, endDate);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {periods.map((p) => (
        <button key={p.value} onClick={() => handlePeriodClick(p.value)}
          className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
            value === p.value
              ? "bg-dnews-accent text-white"
              : "border border-dnews-border text-dnews-gray hover:bg-dnews-light-gray"
          }`}>
          {p.label}
        </button>
      ))}
      {showCustom && (
        <div className="flex items-center gap-2 ml-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-xs outline-none focus:border-dnews-accent" />
          <span className="text-xs text-dnews-muted">to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-xs outline-none focus:border-dnews-accent" />
          <button onClick={handleCustomApply}
            className="rounded-sm bg-dnews-accent px-3 py-1.5 text-xs font-medium text-white">Apply</button>
        </div>
      )}
    </div>
  );
}
