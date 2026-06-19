import type { GeoGebraVisual } from "./practice-types";
import {
  buildStableGeometryCommands,
  normalizeShapeType,
} from "./practice-geometry-engine";

export type GeometryShapeType =
  | "point"
  | "line"
  | "ray"
  | "segment"
  | "angle"
  | "triangle"
  | "right_triangle"
  | "isosceles"
  | "equilateral"
  | "rectangle"
  | "square"
  | "parallelogram"
  | "rhombus"
  | "trapezoid"
  | "isosceles_trapezoid"
  | "circle"
  | "tangent"
  | "chord"
  | "inscribed_angle"
  | "median"
  | "altitude"
  | "bisector"
  | "perpendicular_bisector"
  | "parabola"
  | "box_3d"
  | "cube_3d"
  | "prism_3d"
  | "pyramid_3d"
  | "cylinder_3d"
  | "cone_3d"
  | "sphere_3d";

export type GeometryData = {
  shapeType: GeometryShapeType | string;
  labels?: string[];
  dimensions: Record<string, number>;
  rightAngleAt?: string;
  unit?: string;
  showLabels?: boolean;
  auxPoints?: Record<string, { on: [string, string]; ratio: number }>;
  constructionLines?: { from: string; to: string }[];
};

function applyAux(data: GeometryData, cmds: string[]) {
  for (const [name, spec] of Object.entries(data.auxPoints ?? {})) {
    const [a, b] = spec.on;
    cmds.push(`${name}=Point(${a}, ${b}, ${spec.ratio})`);
    cmds.push(`ShowLabel(${name}, true)`);
  }
  for (const line of data.constructionLines ?? []) {
    cmds.push(`Segment(${line.from}, ${line.to})`);
  }
}

/** Dựng GeoGebra từ diagramData — nhãn & kích thước theo đề */
export function buildGeoGebraFromGeometryData(data: GeometryData): GeoGebraVisual {
  const shape = normalizeShapeType(String(data.shapeType));
  const { commands, view } = buildStableGeometryCommands({ ...data, shapeType: shape });

  applyAux(data, commands);

  return { kind: "geogebra", initCommands: commands, view };
}

export function parseGeometryData(raw: unknown): GeometryData | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const shapeType = normalizeShapeType(String(o.shapeType ?? o.shape ?? "").trim());
  if (!shapeType) return undefined;

  const dimensions: Record<string, number> = {};
  const rawDims = o.dimensions as Record<string, unknown> | undefined;
  if (rawDims && typeof rawDims === "object") {
    for (const [k, v] of Object.entries(rawDims)) {
      const n = Number(v);
      if (Number.isFinite(n)) dimensions[k] = n;
    }
  }

  for (const key of ["a", "b", "r", "width", "height", "side", "base"]) {
    if (dimensions[key] === undefined && o[key] !== undefined) {
      const n = Number(o[key]);
      if (Number.isFinite(n)) dimensions[key] = n;
    }
  }

  if (Object.keys(dimensions).length === 0) return undefined;

  return {
    shapeType,
    labels: Array.isArray(o.labels)
      ? (o.labels as unknown[]).map((x) => String(x).trim()).filter(Boolean)
      : undefined,
    dimensions,
    rightAngleAt: o.rightAngleAt ? String(o.rightAngleAt) : undefined,
    unit: o.unit ? String(o.unit) : "cm",
    showLabels: o.showLabels !== false,
    auxPoints: o.auxPoints as GeometryData["auxPoints"],
    constructionLines: o.constructionLines as GeometryData["constructionLines"],
  };
}
