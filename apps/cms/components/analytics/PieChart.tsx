"use client";

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  innerRadius?: number;
}

export default function PieChart({ data, size = 200, innerRadius = 60 }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center" style={{ width: size, height: size }}><span className="text-xs text-dnews-muted">No data</span></div>;

  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 10;
  const innerR = innerRadius;

  let currentAngle = -Math.PI / 2;
  const slices = data.filter((d) => d.value > 0).map((d) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const start = currentAngle;
    const end = currentAngle + angle;
    currentAngle = end;

    const x1 = cx + outerR * Math.cos(start);
    const y1 = cy + outerR * Math.sin(start);
    const x2 = cx + outerR * Math.cos(end);
    const y2 = cy + outerR * Math.sin(end);
    const ix1 = cx + innerR * Math.cos(start);
    const iy1 = cy + innerR * Math.sin(start);
    const ix2 = cx + innerR * Math.cos(end);
    const iy2 = cy + innerR * Math.sin(end);
    const largeArc = angle > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1}`,
      "Z",
    ].join(" ");

    const midAngle = start + angle / 2;
    const labelR = outerR + 20;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    return { path, color: d.color, label: d.label, value: d.value, percentage: (d.value / total) * 100, lx, ly, midAngle };
  });

  return (
    <svg width={size + 80} height={size + 20} viewBox={`0 0 ${size + 80} ${size + 20}`}>
      <g transform={`translate(0, 0)`}>
        {slices.map((s, i) => (
          <g key={i}>
            <path d={s.path} fill={s.color} opacity={0.85} stroke="white" strokeWidth={2}>
              <title>{s.label}: {s.value} ({s.percentage.toFixed(1)}%)</title>
            </path>
            {s.percentage > 5 && (
              <text x={s.lx} y={s.ly + 4} textAnchor={s.midAngle > Math.PI / 2 && s.midAngle < 3 * Math.PI / 2 ? "end" : "start"} className="text-[10px] fill-gray-500 font-medium">
                {s.percentage.toFixed(0)}%
              </text>
            )}
          </g>
        ))}
        <text x={cx} y={cy + 4} textAnchor="middle" className="text-lg font-bold fill-gray-700">{total}</text>
        <text x={cx} y={cy + 18} textAnchor="middle" className="text-[9px] fill-gray-400">Total</text>
      </g>
    </svg>
  );
}
