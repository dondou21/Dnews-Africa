"use client";

interface GaugeProps {
  value: number;
  max?: number;
  label: string;
  size?: number;
  color?: string;
}

export default function Gauge({ value, max = 100, label, size = 120, color = "#D4A04A" }: GaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 80) return "#22c55e";
    if (pct >= 50) return "#D4A04A";
    return "#ef4444";
  };

  const gaugeColor = getColor(percentage);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none" stroke={gaugeColor} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" className="text-xl font-bold fill-gray-700">
          {typeof value === "number" ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
        </text>
        <text x={size / 2} y={size / 2 + 12} textAnchor="middle" className="text-[9px] fill-gray-400">{label}</text>
      </svg>
    </div>
  );
}
