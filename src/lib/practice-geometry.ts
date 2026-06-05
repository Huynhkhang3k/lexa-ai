import type { GeoShape, SvgAngle, SvgEdge, SvgVisual } from "./practice-types";

export type LayoutPoint = { x: number; y: number; label: string };
export type LayoutEdge = {
  from: LayoutPoint;
  to: LayoutPoint;
  label: string;
  midX: number;
  midY: number;
};
export type LayoutAngle = {
  vertex: LayoutPoint;
  arm1: LayoutPoint;
  arm2: LayoutPoint;
  degrees: number;
  rightAngle: boolean;
};

export type LayoutSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
};

export type GeometryLayout = {
  points: LayoutPoint[];
  polygon: string;
  edges: LayoutEdge[];
  angles: LayoutAngle[];
  circle?: { cx: number; cy: number; r: number; label?: string };
  auxPoints: LayoutPoint[];
  segments: LayoutSegment[];
  viewBox: string;
  shape: GeoShape;
};

const W = 440;
const H = 300;
const PAD = 48;

function edgeKey(a: string, b: string) {
  return [a, b].sort().join("");
}

function getEdgeLen(edges: SvgEdge[], a: string, b: string): number | undefined {
  const k = edgeKey(a, b);
  for (const e of edges) {
    if (edgeKey(e.from, e.to) === k) return e.length;
  }
  return undefined;
}

function edgesFromSides(sides: Record<string, number>, unit: string): SvgEdge[] {
  const out: SvgEdge[] = [];
  const keys = Object.keys(sides);
  for (const k of keys) {
    if (k.length === 2) {
      out.push({ from: k[0]!, to: k[1]!, length: sides[k]!, unit });
    } else if (k === "width" || k === "height" || k === "r") {
      /* handled separately */
    }
  }
  return out;
}

function parseEdges(visual: SvgVisual): SvgEdge[] {
  const unit = visual.unit ?? "cm";
  if (visual.edges?.length) {
    return visual.edges.map((e) => ({ ...e, unit: e.unit ?? unit }));
  }
  if (visual.sides) return edgesFromSides(visual.sides, unit);
  return [];
}

function parsePromptAngles(prompt: string): SvgAngle[] {
  const angles: SvgAngle[] = [];
  const re = /(?:góc|∠)\s*([A-Z])\s*=\s*(\d+(?:[.,]\d+)?)\s*°/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(prompt)) !== null) {
    const vtx = m[1]!;
    const deg = parseFloat(m[2]!.replace(",", "."));
    if (deg === 90) continue;
    angles.push({ vertex: vtx, arm1: "A", arm2: "B", degrees: deg });
  }
  return angles;
}

function rightAngleVertexFromPrompt(prompt: string): string | undefined {
  const m = prompt.match(/(?:góc|∠)\s*([A-Z])\s*=\s*90\s*°|vuông\s*tại\s*([A-Z])/i);
  if (m) return (m[1] ?? m[2])?.toUpperCase();
  if (/tam giác vuông/i.test(prompt)) {
    const leg = prompt.match(/(?:góc|∠)\s*([A-Z])\s*=\s*90/i);
    return leg?.[1]?.toUpperCase() ?? "A";
  }
  return undefined;
}

/** Đọc dữ kiện từ prompt nếu AI thiếu */
export function inferGeometryFromPrompt(prompt: string, visual: SvgVisual): SvgVisual {
  const edges = [...(visual.edges ?? [])];
  const unit = visual.unit ?? "cm";
  const angles = [...(visual.angles ?? [])];
  const auxPoints = { ...(visual.auxPoints ?? {}) };
  const constructionLines = [...(visual.constructionLines ?? [])];

  const addEdge = (from: string, to: string, length: number) => {
    if (!getEdgeLen(edges, from, to)) {
      edges.push({ from, to, length, unit });
    }
  };

  const edgeRe = /([A-Z]{2})\s*=\s*(\d+(?:[.,]\d+)?)\s*(cm|m|mm)?/gi;
  let m: RegExpExecArray | null;
  while ((m = edgeRe.exec(prompt)) !== null) {
    const seg = m[1]!;
    addEdge(seg[0]!, seg[1]!, parseFloat(m[2]!.replace(",", ".")));
  }

  let shape = visual.shape;
  if (/hình vuông/i.test(prompt)) shape = "square";
  else if (/hình chữ nhật/i.test(prompt)) shape = "rectangle";
  else if (/tam giác vuông|vuông tại/i.test(prompt)) shape = "right_triangle";
  else if (/tam giác cân|AB\s*=\s*AC/i.test(prompt)) shape = "isosceles";
  else if (/tam giác đều/i.test(prompt)) shape = "equilateral";
  else if (/đường tròn|hình tròn/i.test(prompt)) shape = "circle";

  const rightVtx = rightAngleVertexFromPrompt(prompt);
  const rightAngleAt = visual.rightAngleAt ?? rightVtx;

  const rMatch = prompt.match(/(?:bán kính|R)\s*=\s*(\d+(?:[.,]\d+)?)/i);
  const dMatch = prompt.match(/(?:đường kính|D)\s*=\s*(\d+(?:[.,]\d+)?)/i);
  const radius =
    visual.radius ??
    (rMatch ? parseFloat(rMatch[1]!.replace(",", ".")) : undefined) ??
    (dMatch ? parseFloat(dMatch[1]!.replace(",", ".")) / 2 : undefined);
  const diameter =
    visual.diameter ??
    (dMatch ? parseFloat(dMatch[1]!.replace(",", ".")) : radius ? radius * 2 : undefined);

  if (/đường cao\s*A\s*H|AH\s*(?:là|:)?\s*đường cao|chân đường cao\s*H/i.test(prompt)) {
    if (!auxPoints.H) auxPoints.H = { on: ["B", "C"], ratio: 0.45 };
    if (!constructionLines.some((l) => l.from === "A" && l.to === "H")) {
      constructionLines.push({ from: "A", to: "H", dashed: true });
    }
  }

  if (/điểm\s*D\s*đối xứng|D\s*đối xứng\s*A\s*qua\s*H/i.test(prompt)) {
    if (!auxPoints.H) auxPoints.H = { on: ["B", "C"], ratio: 0.45 };
    if (!auxPoints.D) auxPoints.D = { mirror: { of: "A", through: "H" } };
    if (!constructionLines.some((l) => l.from === "A" && l.to === "D")) {
      constructionLines.push({ from: "A", to: "D", dashed: true });
    }
  }

  for (const a of parsePromptAngles(prompt)) {
    if (!angles.some((x) => x.vertex === a.vertex && x.degrees === a.degrees)) {
      angles.push(a);
    }
  }

  return {
    ...visual,
    shape,
    edges: edges.length ? edges : visual.edges,
    rightAngleAt,
    radius,
    diameter,
    unit,
    angles: angles.length ? angles : visual.angles,
    auxPoints: Object.keys(auxPoints).length ? auxPoints : visual.auxPoints,
    constructionLines: constructionLines.length ? constructionLines : visual.constructionLines,
  };
}

function computeMathPoints(visual: SvgVisual): Record<string, [number, number]> {
  const edges = parseEdges(visual);
  const e = (a: string, b: string, fallback: number) =>
    getEdgeLen(edges, a, b) ?? fallback;

  switch (visual.shape) {
    case "square": {
      const s = e("A", "B", visual.sides?.AB ?? edges[0]?.length ?? 4);
      return { A: [0, 0], B: [s, 0], C: [s, s], D: [0, s] };
    }
    case "rectangle": {
      const w = e("A", "B", visual.sides?.AB ?? visual.sides?.width ?? 8);
      const h = e("B", "C", visual.sides?.BC ?? visual.sides?.height ?? 5);
      return { A: [0, 0], B: [w, 0], C: [w, h], D: [0, h] };
    }
    case "right_triangle": {
      const ab = e("A", "B", 6);
      const ac = e("A", "C", 8);
      return { A: [0, 0], B: [ab, 0], C: [0, ac] };
    }
    case "isosceles": {
      const ab = e("A", "B", 6);
      const ac = e("A", "C", 6);
      const bc = e("B", "C", Math.sqrt(ab * ab + ac * ac - 2 * ab * ac * 0.5) || 8);
      const bx = (ab * ab + bc * bc - ac * ac) / (2 * bc);
      const by = Math.sqrt(Math.max(0, ab * ab - bx * bx));
      return { A: [0, 0], B: [bc, 0], C: [bx, by] };
    }
    case "equilateral": {
      const s = e("A", "B", 6);
      return { A: [0, 0], B: [s, 0], C: [s / 2, (s * Math.sqrt(3)) / 2] };
    }
    case "trapezoid": {
      const bottom = e("A", "B", 8);
      const top = e("D", "C", 4);
      const h = e("A", "D", 5);
      const offset = (bottom - top) / 2;
      return { A: [0, 0], B: [bottom, 0], C: [offset + top, h], D: [offset, h] };
    }
    case "parallelogram": {
      const w = e("A", "B", 7);
      const h = e("A", "D", 4);
      const skew = e("B", "C", 0) > 0 ? Math.min(2, w * 0.25) : 2;
      return { A: [0, 0], B: [w, 0], C: [w + skew, h], D: [skew, h] };
    }
    case "circle":
      return { O: [0, 0] };
    default: {
      const ab = e("A", "B", 6);
      const ac = e("A", "C", 7);
      const bc = e("B", "C", 8);
      if (bc && ab && ac) {
        const bx = (ab * ab + bc * bc - ac * ac) / (2 * bc);
        const by = Math.sqrt(Math.max(0, ab * ab - bx * bx));
        return { A: [0, 0], B: [bc, 0], C: [bx, by] };
      }
      return { A: [0, 0], B: [ab, 0], C: [0, ac] };
    }
  }
}

function toScreen(
  mathPts: Record<string, [number, number]>,
): Record<string, LayoutPoint> {
  const entries = Object.entries(mathPts);
  if (entries.length === 0) return {};

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [, [x, y]] of entries) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  const rw = maxX - minX || 1;
  const rh = maxY - minY || 1;
  const scale = Math.min((W - PAD * 2) / rw, (H - PAD * 2) / rh);

  const out: Record<string, LayoutPoint> = {};
  for (const [label, [x, y]] of entries) {
    out[label] = {
      label,
      x: PAD + (x - minX) * scale,
      y: H - PAD - (y - minY) * scale,
    };
  }
  return out;
}

function polygonOrder(
  shape: GeoShape,
  pts: Record<string, LayoutPoint>,
  vertices?: string[],
): string[] {
  const keys = Object.keys(pts);
  if (vertices?.length) return vertices.filter((k) => pts[k]);
  if (
    shape === "triangle" ||
    shape === "right_triangle" ||
    shape === "isosceles" ||
    shape === "equilateral"
  ) {
    return ["A", "B", "C"].filter((k) => pts[k]);
  }
  if (
    shape === "rectangle" ||
    shape === "square" ||
    shape === "trapezoid" ||
    shape === "parallelogram"
  ) {
    return ["A", "B", "C", "D"].filter((k) => pts[k]);
  }
  return keys;
}

function buildEdgeLabels(
  edges: SvgEdge[],
  screen: Record<string, LayoutPoint>,
): LayoutEdge[] {
  return edges
    .map((e) => {
      const from = screen[e.from];
      const to = screen[e.to];
      if (!from || !to) return null;
      const unit = e.unit ?? "cm";
      return {
        from,
        to,
        label: `${e.from}${e.to} = ${e.length} ${unit}`,
        midX: (from.x + to.x) / 2,
        midY: (from.y + to.y) / 2,
      };
    })
    .filter((x): x is LayoutEdge => x !== null);
}

function neighborsOf(
  vertex: string,
  order: string[],
  edges: SvgEdge[],
): string[] {
  const n = new Set<string>();
  for (const e of edges) {
    if (e.from === vertex) n.add(e.to);
    if (e.to === vertex) n.add(e.from);
  }
  const idx = order.indexOf(vertex);
  if (idx >= 0 && order.length >= 3) {
    n.add(order[(idx + 1) % order.length]!);
    n.add(order[(idx - 1 + order.length) % order.length]!);
  }
  return [...n];
}

function buildAngles(
  visual: SvgVisual,
  screen: Record<string, LayoutPoint>,
  order: string[],
  edges: SvgEdge[],
): LayoutAngle[] {
  const out: LayoutAngle[] = [];

  if (visual.rightAngleAt && screen[visual.rightAngleAt]) {
    const v = visual.rightAngleAt;
    const arms = neighborsOf(v, order, edges).filter((k) => screen[k]);
    if (arms.length >= 2) {
      out.push({
        vertex: screen[v]!,
        arm1: screen[arms[0]!]!,
        arm2: screen[arms[1]!]!,
        degrees: 90,
        rightAngle: true,
      });
    }
  }

  for (const a of visual.angles ?? []) {
    const vtx = screen[a.vertex];
    if (!vtx) continue;
    let arm1 = screen[a.arm1];
    let arm2 = screen[a.arm2];
    if (!arm1 || !arm2) {
      const nb = neighborsOf(a.vertex, order, edges).filter((k) => screen[k]);
      if (nb.length >= 2) {
        arm1 = screen[nb[0]!]!;
        arm2 = screen[nb[1]!]!;
      }
    }
    if (arm1 && arm2) {
      out.push({
        vertex: vtx,
        arm1,
        arm2,
        degrees: a.degrees,
        rightAngle: a.rightAngle ?? a.degrees === 90,
      });
    }
  }

  return out;
}

function altitudeRatioOnBc(
  mathPts: Record<string, [number, number]>,
  visual: SvgVisual,
): number | undefined {
  const a = mathPts.A;
  const b = mathPts.B;
  const c = mathPts.C;
  if (!a || !b || !c || visual.shape !== "right_triangle") return undefined;
  const ab = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ac = Math.hypot(c[0] - a[0], c[1] - a[1]);
  if (ab < 1e-6 || ac < 1e-6) return undefined;
  const bc2 = ab * ab + ac * ac;
  return (ab * ab) / bc2;
}

function resolveAuxMathPoints(
  visual: SvgVisual,
  mathPts: Record<string, [number, number]>,
): Record<string, [number, number]> {
  const out: Record<string, [number, number]> = {};
  const specs = visual.auxPoints ?? {};
  const autoAlt = altitudeRatioOnBc(mathPts, visual);

  for (const [name, spec] of Object.entries(specs)) {
    if ("on" in spec) {
      const [a, b] = spec.on;
      const pa = mathPts[a];
      const pb = mathPts[b];
      if (!pa || !pb) continue;
      const ratio =
        name === "H" && a === "B" && b === "C" && autoAlt !== undefined
          ? autoAlt
          : spec.ratio;
      out[name] = [
        pa[0] + (pb[0] - pa[0]) * ratio,
        pa[1] + (pb[1] - pa[1]) * ratio,
      ];
    }
  }

  for (const [name, spec] of Object.entries(specs)) {
    if (!("mirror" in spec)) continue;
    const { of, through } = spec.mirror;
    const src = mathPts[of] ?? out[of];
    const mid = mathPts[through] ?? out[through];
    if (!src || !mid) continue;
    out[name] = [2 * mid[0] - src[0], 2 * mid[1] - src[1]];
  }

  return out;
}

function buildAuxPoints(
  auxMath: Record<string, [number, number]>,
): LayoutPoint[] {
  const scaled = toScreen(auxMath);
  return Object.values(scaled);
}

function buildConstructionSegments(
  visual: SvgVisual,
  screen: Record<string, LayoutPoint>,
): LayoutSegment[] {
  const segs: LayoutSegment[] = [];
  for (const line of visual.constructionLines ?? []) {
    const from = screen[line.from];
    const to = screen[line.to];
    if (!from || !to) continue;
    segs.push({
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      dashed: line.dashed !== false,
    });
  }
  return segs;
}

export function buildGeometryLayout(visual: SvgVisual): GeometryLayout {
  const enriched = visual;
  const mathPts =
    visual.points && Object.keys(visual.points).length >= 2
      ? visual.points
      : computeMathPoints(enriched);

  const screen = toScreen(mathPts);
  const order = polygonOrder(visual.shape, screen, visual.vertices);
  const polyPts = order.map((k) => screen[k]!).filter(Boolean);
  const polygon = polyPts.map((p) => `${p.x},${p.y}`).join(" ");

  const edges = parseEdges(enriched);
  const auxMath = resolveAuxMathPoints(enriched, mathPts);
  const allMath = { ...mathPts, ...auxMath };
  const allScreen = { ...screen, ...toScreen(auxMath) };

  const layoutEdges = buildEdgeLabels(edges, allScreen);
  const angles = buildAngles(enriched, allScreen, order, edges);
  const auxPoints = buildAuxPoints(auxMath);
  const segments = buildConstructionSegments(enriched, allScreen);

  const r =
    enriched.radius ??
    (enriched.diameter ? enriched.diameter / 2 : undefined) ??
    3;
  const circle =
    visual.shape === "circle" && screen.O
      ? {
          cx: screen.O.x,
          cy: screen.O.y,
          r: Math.min(90, r * (Math.min(W, H) / 14)),
          label: `R = ${r} ${enriched.unit ?? "cm"}`,
        }
      : undefined;

  return {
    points: polyPts,
    polygon,
    edges: layoutEdges,
    angles,
    circle,
    auxPoints,
    segments,
    viewBox: `0 0 ${W} ${H}`,
    shape: visual.shape,
  };
}

function fillRectangleEdges(
  edges: SvgEdge[],
  unit: string | undefined,
): SvgEdge[] {
  const ab = getEdgeLen(edges, "A", "B") ?? edges[0]?.length ?? 8;
  const bc = getEdgeLen(edges, "B", "C") ?? edges[1]?.length ?? 5;
  const u = unit ?? "cm";
  return [
    { from: "A", to: "B", length: ab, unit: u },
    { from: "B", to: "C", length: bc, unit: u },
    { from: "C", to: "D", length: ab, unit: u },
    { from: "D", to: "A", length: bc, unit: u },
  ];
}

function fillIsoscelesEdges(
  edges: SvgEdge[],
  unit: string | undefined,
): SvgEdge[] {
  const ab = getEdgeLen(edges, "A", "B") ?? edges[0]?.length ?? 6;
  const ac = getEdgeLen(edges, "A", "C") ?? ab;
  const leg = Math.max(ab, ac);
  const u = unit ?? "cm";
  return [
    { from: "A", to: "B", length: leg, unit: u },
    { from: "A", to: "C", length: leg, unit: u },
    { from: "B", to: "C", length: getEdgeLen(edges, "B", "C") ?? leg * 1.2, unit: u },
  ];
}

export function validateSvgVisual(visual: SvgVisual, prompt: string): SvgVisual {
  let v = inferGeometryFromPrompt(prompt, visual);
  const edges = parseEdges(v);
  const u = v.unit ?? "cm";

  if (v.shape === "square" && edges.length >= 1) {
    const len = getEdgeLen(edges, "A", "B") ?? edges[0]!.length;
    v.edges = [
      { from: "A", to: "B", length: len, unit: u },
      { from: "B", to: "C", length: len, unit: u },
      { from: "C", to: "D", length: len, unit: u },
      { from: "D", to: "A", length: len, unit: u },
    ];
  }

  if (v.shape === "rectangle") {
    v.edges = fillRectangleEdges(edges, u);
    v.vertices = ["A", "B", "C", "D"];
  }

  if (v.shape === "isosceles") {
    v.edges = fillIsoscelesEdges(edges, u);
    v.vertices = ["A", "B", "C"];
  }

  if (v.shape === "right_triangle") {
    if (!v.rightAngleAt) v.rightAngleAt = "A";
    const ab = getEdgeLen(edges, "A", "B") ?? 6;
    const ac = getEdgeLen(edges, "A", "C") ?? 8;
    const bc = getEdgeLen(edges, "B", "C");
    v.edges = [
      { from: "A", to: "B", length: ab, unit: u },
      { from: "A", to: "C", length: ac, unit: u },
      ...(bc
        ? [{ from: "B", to: "C", length: bc, unit: u }]
        : []),
    ];
    v.vertices = ["A", "B", "C"];
  }

  if (v.shape === "equilateral" && edges.length >= 1) {
    const s = getEdgeLen(edges, "A", "B") ?? edges[0]!.length;
    v.edges = [
      { from: "A", to: "B", length: s, unit: u },
      { from: "B", to: "C", length: s, unit: u },
      { from: "C", to: "A", length: s, unit: u },
    ];
  }

  return v;
}

export function promptNeedsGeometryVisual(prompt: string, topic: string): boolean {
  return (
    /hình học/i.test(topic) ||
    /tam giác|hình chữ nhật|hình vuông|đường tròn|hình tròn|vuông tại|góc\s*[A-Z]\s*=|∠[A-Z]/i.test(
      prompt,
    )
  );
}
