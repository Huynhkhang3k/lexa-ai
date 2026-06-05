"use client";

import type { RiasecCode } from "@/lib/holland-riasec";
import { cn } from "@/lib/utils";

type Point = { code: RiasecCode; label: string; value: number };

type HollandRadarChartProps = {
  data: Point[];
  className?: string;
  size?: number;
};

export function HollandRadarChart({ data, className, size = 280 }: HollandRadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  const pointAt = (i: number, r: number) => {
    const angle = -Math.PI / 2 + i * angleStep;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = data.map((d, i) => pointAt(i, (d.value / 100) * maxR));
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("mx-auto w-full max-w-[320px]", className)}
      role="img"
      aria-label="Biểu đồ radar điểm RIASEC"
    >
      {gridLevels.map((level) => {
        const pts = Array.from({ length: n }, (_, i) => {
          const p = pointAt(i, maxR * level);
          return `${p.x},${p.y}`;
        }).join(" ");
        return (
          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.12}
            className="text-slate-400 dark:text-white/30"
          />
        );
      })}
      {data.map((d, i) => {
        const outer = pointAt(i, maxR);
        const inner = pointAt(i, maxR * 0.15);
        return (
          <line
            key={d.code}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="currentColor"
            strokeOpacity={0.15}
            className="text-slate-400 dark:text-white/25"
          />
        );
      })}
      <polygon
        points={polygon}
        fill="url(#radarFill)"
        stroke="url(#radarStroke)"
        strokeWidth={2}
        className="drop-shadow-sm"
      />
      {dataPoints.map((p, i) => (
        <circle key={data[i].code} cx={p.x} cy={p.y} r={4} className="fill-cyan-400" />
      ))}
      {data.map((d, i) => {
        const labelR = maxR + 22;
        const p = pointAt(i, labelR);
        return (
          <text
            key={`lbl-${d.code}`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-700 text-[11px] font-bold dark:fill-white/90"
          >
            {d.code}
          </text>
        );
      })}
      <defs>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(192 132 252)" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(34 211 238)" />
          <stop offset="100%" stopColor="rgb(217 70 239)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
