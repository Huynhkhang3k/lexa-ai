import type { GeoGebraView } from "./practice-types";
import type { GeometryData } from "./practice-geometry-builder";

/** Scale đều 2 trục — khớp prototype HTML 600×600 */
export const STABLE_COORD_VIEW: GeoGebraView = {
  xmin: -10,
  xmax: 10,
  ymin: -10,
  ymax: 10,
};

const DEFAULT_VERTICES = ["A", "B", "C", "D", "E", "F", "G", "H", "O", "P", "Q", "R"];

export function normalizeShapeType(raw: string): string {
  const key = raw.toLowerCase().replace(/\s+/g, "_").trim();
  const aliases: Record<string, string> = {
    rect: "rectangle",
    hình_chữ_nhật: "rectangle",
    hinh_chu_nhat: "rectangle",
    hình_vuông: "square",
    hinh_vuong: "square",
    hình_tròn: "circle",
    hinh_tron: "circle",
    đường_tròn: "circle",
    duong_tron: "circle",
    tam_giác: "triangle",
    tam_giac: "triangle",
    parabol: "parabola",
    parabola: "parabola",
  };
  return aliases[key] ?? key;
}

/** Tên đỉnh theo đề — fallback A,B,C… */
export function vertexLabels(provided: string[] | undefined, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const name = provided?.[i]?.trim();
    return name && /^[A-Z][A-Z0-9']*$/i.test(name) ? name.toUpperCase() : DEFAULT_VERTICES[i]!;
  });
}

function dim(dims: Record<string, number>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = dims[k];
    if (v !== undefined && Number.isFinite(v)) return v;
  }
  return undefined;
}

function edgeLen(dims: Record<string, number>, a: string, b: string, fallback: number) {
  return dims[`${a}${b}`] ?? dims[`${b}${a}`] ?? dims[a.toLowerCase()] ?? dims[b.toLowerCase()] ?? fallback;
}

function stableView(maxExtent: number): GeoGebraView {
  if (maxExtent <= 8) return STABLE_COORD_VIEW;
  const pad = Math.max(2, maxExtent * 0.25);
  return {
    xmin: -pad,
    xmax: maxExtent + pad,
    ymin: -pad,
    ymax: maxExtent + pad,
  };
}

function labelVertices(names: string[], cmds: string[]) {
  for (const n of names) {
    if (cmds.some((c) => c.startsWith(`${n}=`) || c.includes(`${n}=(`))) {
      cmds.push(`ShowLabel(${n}, true)`);
    }
  }
}

function edgeCaption(a: string, b: string, len: number, unit: string) {
  return `SetCaption(Segment(${a}, ${b}), "${a}${b} = ${len} ${unit}")`;
}

export type StableDrawResult = { commands: string[]; view: GeoGebraView };

/**
 * Engine vẽ hình ổn định — theo input đề (dimensions + labels).
 * Parabol: chỉ y = ax² (không b, không c).
 */
export function buildStableGeometryCommands(data: GeometryData): StableDrawResult {
  const unit = data.unit ?? "cm";
  const dims = data.dimensions;
  const shape = normalizeShapeType(String(data.shapeType));
  const cmds: string[] = [];
  let view = STABLE_COORD_VIEW;

  switch (shape) {
    case "circle": {
      const r = dim(dims, "r", "R", "radius", "a") ?? 3;
      const [O] = vertexLabels(data.labels, 1);
      cmds.push(`${O}=(0,0)`, `c=Circle(${O}, ${r})`);
      cmds.push(`SetCaption(${O}, "R = ${r} ${unit}")`);
      view = stableView(r * 2);
      labelVertices([O], cmds);
      break;
    }
    case "square": {
      const s = dim(dims, "side", "a", "AB") ?? edgeLen(dims, "A", "B", 4);
      const [A, B, C, D] = vertexLabels(data.labels, 4);
      cmds.push(
        `${A}=(0,0)`,
        `${B}=(${s},0)`,
        `${C}=(${s},${s})`,
        `${D}=(0,${s})`,
        `Polygon(${A},${B},${C},${D})`,
      );
      cmds.push(edgeCaption(A, B, s, unit));
      view = stableView(s);
      labelVertices([A, B, C, D], cmds);
      break;
    }
    case "rectangle": {
      const w = dim(dims, "width", "a", "AB") ?? edgeLen(dims, "A", "B", 5);
      const h = dim(dims, "height", "b", "BC") ?? edgeLen(dims, "B", "C", 3);
      const [A, B, C, D] = vertexLabels(data.labels, 4);
      cmds.push(
        `${A}=(0,0)`,
        `${B}=(${w},0)`,
        `${C}=(${w},${h})`,
        `${D}=(0,${h})`,
        `Polygon(${A},${B},${C},${D})`,
      );
      cmds.push(edgeCaption(A, B, w, unit), edgeCaption(B, C, h, unit));
      view = stableView(Math.max(w, h));
      labelVertices([A, B, C, D], cmds);
      break;
    }
    case "triangle":
    case "isosceles":
    case "isosceles_triangle": {
      const base = dim(dims, "base", "a", "AB") ?? edgeLen(dims, "A", "B", 5);
      const height = dim(dims, "height", "b", "h") ?? dim(dims, "BC") ?? 4;
      const [A, B, C] = vertexLabels(data.labels, 3);
      cmds.push(
        `${A}=(0,0)`,
        `${B}=(${base},0)`,
        `${C}=(${base / 2},${height})`,
        `Polygon(${A},${B},${C})`,
      );
      cmds.push(edgeCaption(A, B, base, unit));
      view = stableView(Math.max(base, height));
      labelVertices([A, B, C], cmds);
      break;
    }
    case "right_triangle": {
      const ab = edgeLen(dims, "A", "B", dim(dims, "AB", "a") ?? 6);
      const ac = edgeLen(dims, "A", "C", dim(dims, "AC", "b") ?? 8);
      const [A, B, C] = vertexLabels(data.labels, 3);
      cmds.push(`${A}=(0,0)`, `${B}=(${ab},0)`, `${C}=(0,${ac})`, `Polygon(${A},${B},${C})`);
      cmds.push(edgeCaption(A, B, ab, unit), edgeCaption(A, C, ac, unit));
      if (data.rightAngleAt) cmds.push(`Angle(${B},${A},${C})`);
      view = stableView(Math.max(ab, ac));
      labelVertices([A, B, C], cmds);
      break;
    }
    case "equilateral": {
      const s = edgeLen(dims, "A", "B", dim(dims, "AB", "a") ?? 6);
      const h = (s * Math.sqrt(3)) / 2;
      const [A, B, C] = vertexLabels(data.labels, 3);
      cmds.push(`${A}=(0,0)`, `${B}=(${s},0)`, `${C}=(${s / 2},${h})`, `Polygon(${A},${B},${C})`);
      cmds.push(edgeCaption(A, B, s, unit));
      view = stableView(Math.max(s, h));
      labelVertices([A, B, C], cmds);
      break;
    }
    case "parabola":
    case "graph": {
      const coef = dim(dims, "a", "coefficient") ?? 1;
      cmds.push(`f(x)=(${coef})x^2`, "ShowLabel(f, true)");
      view = STABLE_COORD_VIEW;
      break;
    }
    case "parallelogram": {
      const w = dim(dims, "width", "a", "AB") ?? 7;
      const h = dim(dims, "height", "b", "AD") ?? 4;
      const skew = dim(dims, "skew") ?? w * 0.2;
      const [A, B, C, D] = vertexLabels(data.labels, 4);
      cmds.push(
        `${A}=(0,0)`,
        `${B}=(${w},0)`,
        `${C}=(${w + skew},${h})`,
        `${D}=(${skew},${h})`,
        `Polygon(${A},${B},${C},${D})`,
      );
      view = stableView(Math.max(w + skew, h));
      labelVertices([A, B, C, D], cmds);
      break;
    }
    case "rhombus": {
      const d1 = dim(dims, "d1", "a", "AC") ?? 8;
      const d2 = dim(dims, "d2", "b", "BD") ?? 6;
      const [A, B, C, D] = vertexLabels(data.labels, 4);
      cmds.push(
        `${A}=(0,0)`,
        `${B}=(${d1 / 2},${d2 / 2})`,
        `${C}=(${d1},0)`,
        `${D}=(${d1 / 2},${-d2 / 2})`,
        `Polygon(${A},${B},${C},${D})`,
      );
      view = stableView(d1);
      labelVertices([A, B, C, D], cmds);
      break;
    }
    case "trapezoid":
    case "isosceles_trapezoid": {
      const bottom = dim(dims, "bottom", "a", "AB") ?? 8;
      const top = dim(dims, "top", "b", "CD") ?? 4;
      const h = dim(dims, "height", "h") ?? 5;
      const off = (bottom - top) / 2;
      const [A, B, C, D] = vertexLabels(data.labels, 4);
      cmds.push(
        `${A}=(0,0)`,
        `${B}=(${bottom},0)`,
        `${C}=(${off + top},${h})`,
        `${D}=(${off},${h})`,
        `Polygon(${A},${B},${C},${D})`,
      );
      view = stableView(Math.max(bottom, h));
      labelVertices([A, B, C, D], cmds);
      break;
    }
    case "point": {
      const x = dim(dims, "x", "X", "a") ?? 0;
      const y = dim(dims, "y", "Y", "b") ?? 0;
      const [P] = vertexLabels(data.labels, 1);
      cmds.push(`${P}=(${x},${y})`);
      view = stableView(Math.max(Math.abs(x), Math.abs(y)) * 2 + 2);
      labelVertices([P], cmds);
      break;
    }
    default: {
      const ab = edgeLen(dims, "A", "B", dim(dims, "AB", "a") ?? 6);
      const ac = edgeLen(dims, "A", "C", dim(dims, "AC", "b") ?? 8);
      const [A, B, C] = vertexLabels(data.labels, 3);
      cmds.push(`${A}=(0,0)`, `${B}=(${ab},0)`, `${C}=(0,${ac})`, `Polygon(${A},${B},${C})`);
      cmds.push(edgeCaption(A, B, ab, unit));
      view = stableView(Math.max(ab, ac));
      labelVertices([A, B, C], cmds);
    }
  }

  return { commands: cmds, view };
}

export function buildStableParabolaCommands(a: number): StableDrawResult {
  return {
    commands: [`f(x)=(${a})x^2`, "ShowLabel(f, true)"],
    view: STABLE_COORD_VIEW,
  };
}
