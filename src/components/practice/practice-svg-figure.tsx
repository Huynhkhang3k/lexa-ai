"use client";

import * as React from "react";
import { buildGeometryLayout, validateSvgVisual } from "@/lib/practice-geometry";
import type { SvgVisual } from "@/lib/practice-types";

type Props = {
  visual: SvgVisual;
  prompt?: string;
  interactive?: boolean;
  onPick?: (x: number, y: number) => void;
};

function RightAngleMark({
  vertex,
  arm1,
  arm2,
  size = 14,
}: {
  vertex: { x: number; y: number };
  arm1: { x: number; y: number };
  arm2: { x: number; y: number };
  size?: number;
}) {
  const v1 = { x: arm1.x - vertex.x, y: arm1.y - vertex.y };
  const v2 = { x: arm2.x - vertex.x, y: arm2.y - vertex.y };
  const len1 = Math.hypot(v1.x, v1.y) || 1;
  const len2 = Math.hypot(v2.x, v2.y) || 1;
  const p1 = { x: vertex.x + (v1.x / len1) * size, y: vertex.y + (v1.y / len1) * size };
  const p2 = { x: vertex.x + (v2.x / len2) * size, y: vertex.y + (v2.y / len2) * size };
  const corner = {
    x: p1.x + (v2.x / len2) * size,
    y: p1.y + (v2.y / len2) * size,
  };
  return (
    <path
      d={`M ${p1.x} ${p1.y} L ${corner.x} ${corner.y} L ${p2.x} ${p2.y}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className="text-slate-600 dark:text-white/70"
    />
  );
}

function AngleArc({
  vertex,
  arm1,
  arm2,
  degrees,
}: {
  vertex: { x: number; y: number };
  arm1: { x: number; y: number };
  arm2: { x: number; y: number };
  degrees: number;
}) {
  const r = 22;
  const a1 = Math.atan2(arm1.y - vertex.y, arm1.x - vertex.x);
  const a2 = Math.atan2(arm2.y - vertex.y, arm2.x - vertex.x);
  const x1 = vertex.x + r * Math.cos(a1);
  const y1 = vertex.y + r * Math.sin(a1);
  const x2 = vertex.x + r * Math.cos(a2);
  const y2 = vertex.y + r * Math.sin(a2);
  const large = degrees > 180 ? 1 : 0;
  return (
    <g>
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-amber-600 dark:text-amber-400"
      />
      <text
        x={vertex.x + (r + 10) * Math.cos((a1 + a2) / 2)}
        y={vertex.y + (r + 10) * Math.sin((a1 + a2) / 2)}
        fontSize={11}
        className="fill-amber-700 dark:fill-amber-300"
        textAnchor="middle"
      >
        {degrees}°
      </text>
    </g>
  );
}

export function PracticeSvgFigure({ visual, prompt = "", interactive, onPick }: Props) {
  const validated = React.useMemo(
    () => validateSvgVisual(visual, prompt),
    [visual, prompt],
  );
  const layout = React.useMemo(() => buildGeometryLayout(validated), [validated]);

  function handleClick(ev: React.MouseEvent<SVGSVGElement>) {
    if (!interactive || !onPick || layout.points.length === 0) return;
    const svg = ev.currentTarget;
    const rect = svg.getBoundingClientRect();
    const vb = layout.viewBox.split(" ").map(Number);
    const vw = vb[2] ?? 440;
    const vh = vb[3] ?? 300;
    const x = ((ev.clientX - rect.left) / rect.width) * vw;
    const y = ((ev.clientY - rect.top) / rect.height) * vh;
    let best = layout.points[0]!;
    let bestD = Infinity;
    for (const p of [...layout.points, ...layout.auxPoints]) {
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    onPick(Math.round(best.x), Math.round(best.y));
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/40">
      <svg
        viewBox={layout.viewBox}
        className="h-72 w-full"
        role="img"
        onClick={handleClick}
        style={{ cursor: interactive ? "crosshair" : "default" }}
      >
        {layout.circle ? (
          <g>
            <circle
              cx={layout.circle.cx}
              cy={layout.circle.cy}
              r={layout.circle.r}
              fill="rgba(14,165,233,0.06)"
              stroke="currentColor"
              strokeWidth={2}
              className="text-sky-600 dark:text-cyan-400"
            />
            {layout.circle.label ? (
              <text
                x={layout.circle.cx}
                y={layout.circle.cy - layout.circle.r - 8}
                textAnchor="middle"
                fontSize={12}
                className="fill-slate-600 font-medium dark:fill-white/80"
              >
                {layout.circle.label}
              </text>
            ) : null}
          </g>
        ) : null}

        {layout.polygon ? (
          <polygon
            points={layout.polygon}
            fill="rgba(14,165,233,0.07)"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinejoin="round"
            className="text-sky-600 dark:text-cyan-400"
          />
        ) : null}

        {layout.segments.map((seg, i) => (
          <line
            key={`seg-${i}`}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke="currentColor"
            strokeWidth={1.8}
            strokeDasharray={seg.dashed ? "6 4" : undefined}
            className="text-violet-500 dark:text-violet-400"
          />
        ))}

        {layout.edges.map((edge, i) => {
          const dx = edge.to.x - edge.from.x;
          const dy = edge.to.y - edge.from.y;
          const len = Math.hypot(dx, dy) || 1;
          const nx = (-dy / len) * 14;
          const ny = (dx / len) * 14;
          return (
            <text
              key={i}
              x={edge.midX + nx}
              y={edge.midY + ny}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              className="fill-sky-800 dark:fill-cyan-200"
            >
              {edge.label}
            </text>
          );
        })}

        {layout.angles.map((ang, i) =>
          ang.rightAngle ? (
            <RightAngleMark
              key={i}
              vertex={ang.vertex}
              arm1={ang.arm1}
              arm2={ang.arm2}
            />
          ) : (
            <AngleArc
              key={i}
              vertex={ang.vertex}
              arm1={ang.arm1}
              arm2={ang.arm2}
              degrees={ang.degrees}
            />
          ),
        )}

        {layout.auxPoints.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r={4} className="fill-violet-500" />
            <text
              x={p.x + 8}
              y={p.y - 6}
              fontSize={13}
              fontWeight={600}
              className="fill-violet-700 dark:fill-violet-300"
            >
              {p.label}
            </text>
          </g>
        ))}

        {layout.points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r={5} className="fill-sky-500 dark:fill-cyan-400" />
            {validated.showLabels !== false ? (
              <text
                x={p.x + (p.x < 220 ? -14 : 10)}
                y={p.y + (p.y < 150 ? -10 : 18)}
                fontSize={15}
                fontWeight={700}
                className="fill-slate-800 dark:fill-white"
              >
                {p.label}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}
