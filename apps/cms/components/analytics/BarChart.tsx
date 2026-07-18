"use client";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  maxBarWidth?: number;
  showValues?: boolean;
}

export default function BarChart({ data, height = 200, maxBarWidth = 60, showValues = true }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const chartWidth = Math.max(data.length * (maxBarWidth + 12), 100);

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartWidth} height={height} className="min-w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            <line x1={0} y1={height - height * tick} x2={chartWidth} y2={height - height * tick} stroke="#e5e7eb" strokeWidth={1} />
            <text x={-4} y={height - height * tick + 4} textAnchor="end" className="text-[10px] fill-gray-400">
              {Math.round(max * tick)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (height - 25);
          const x = i * (maxBarWidth + 12) + 10;
          const y = height - barHeight - 5;
          return (
            <g key={i}>
              <rect x={x} y={y} width={maxBarWidth} height={barHeight} rx={3} fill={d.color ?? "#D4A04A"} opacity={0.85}>
                <title>{d.label}: {d.value}</title>
              </rect>
              {showValues && barHeight > 15 && (
                <text x={x + maxBarWidth / 2} y={y + barHeight / 2 + 4} textAnchor="middle" className="text-[10px] fill-white font-medium">
                  {d.value}
                </text>
              )}
              <text x={x + maxBarWidth / 2} y={height - 1} textAnchor="middle" className="text-[9px] fill-gray-400 truncate">
                {d.label.length > 8 ? d.label.slice(0, 8) + "…" : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
