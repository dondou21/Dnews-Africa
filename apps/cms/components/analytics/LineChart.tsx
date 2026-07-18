"use client";

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  showArea?: boolean;
  showDots?: boolean;
}

export default function LineChart({ data, height = 200, color = "#D4A04A", showArea = true, showDots = true }: LineChartProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 10, right: 10, bottom: 25, left: 40 };
  const chartW = Math.max(data.length * 40, 200);
  const w = chartW;
  const h = height;

  const xScale = (i: number) => padding.left + (i / (data.length - 1 || 1)) * (w - padding.left - padding.right);
  const yScale = (v: number) => h - padding.bottom - ((v / max) * (h - padding.top - padding.bottom));

  const points = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(" ");
  const areaPoints = `${xScale(0)},${h - padding.bottom} ${points} ${xScale(data.length - 1)},${h - padding.bottom}`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));

  return (
    <div className="w-full overflow-x-auto">
      <svg width={w} height={h} className="min-w-full">
        {yTicks.map((tick) => {
          const y = yScale(tick);
          return (
            <g key={tick}>
              <line x1={padding.left} y1={y} x2={w} y2={y} stroke="#e5e7eb" strokeWidth={1} />
              <text x={padding.left - 6} y={y + 3} textAnchor="end" className="text-[10px] fill-gray-400">{tick}</text>
            </g>
          );
        })}
        {showArea && (
          <polygon points={areaPoints} fill={color} fillOpacity={0.1} />
        )}
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
        {showDots && data.map((d, i) => (
          <circle key={i} cx={xScale(i)} cy={yScale(d.value)} r={3} fill="white" stroke={color} strokeWidth={2}>
            <title>{d.label}: {d.value}</title>
          </circle>
        ))}
        {data.filter((_, i) => data.length <= 14 || i % Math.ceil(data.length / 10) === 0).map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text key={idx} x={xScale(idx)} y={h - 6} textAnchor="middle" className="text-[9px] fill-gray-400" transform={`rotate(-30, ${xScale(idx)}, ${h - 6})`}>
              {d.label.length > 6 ? d.label.slice(0, 6) + "…" : d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
