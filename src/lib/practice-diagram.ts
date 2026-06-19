import { buildGeoGebraFromGeometryData, parseGeometryData, type GeometryData } from "./practice-geometry-builder";
import { buildStableParabolaCommands } from "./practice-geometry-engine";
import { validateGeoGebraVisual } from "./practice-geogebra";
import type { GeoGebraVisual } from "./practice-types";

export type GraphDiagramData = {
  diagramType: "graph";
  /** Chỉ hệ số a; b=0, c=0 mặc định → y = ax² */
  a: number;
};

export type ChartDiagramData = {
  diagramType: "chart";
  chartType: "bar" | "bar_double" | "pie" | "line";
  values: number[];
  values2?: number[];
  labels?: string[];
};

export type GeometryDiagramData = GeometryData & { diagramType: "geometry" };

export type DiagramData = GeometryDiagramData | GraphDiagramData | ChartDiagramData;

const DIAGRAM_REF_RE =
  /như hình|hình vẽ|đồ thị|biểu đồ|hình học|tam giác|hình chữ nhật|hình vuông|đường tròn|parabol|như hình vẽ|trên hình|trong hình|xem hình|theo hình/i;

const VAGUE_TF_RE =
  /phát biểu nào|mệnh đề nào|khẳng định nào|câu nào sau đây đúng|điều nào sau đây/i;

export function promptRequiresDiagram(
  prompt: string,
  type: string,
  category?: string,
): boolean {
  const visualTypes = new Set([
    "graph_pick",
    "geo_pick",
    "geo_drag",
    "geometry",
    "coordinate_geometry",
    "function_graph",
    "vector",
  ]);
  if (visualTypes.has(type)) return true;
  if (category === "geometry") return true;
  return DIAGRAM_REF_RE.test(prompt);
}

export function isVagueTrueFalse(prompt: string, statement?: string): boolean {
  if (!VAGUE_TF_RE.test(prompt)) return false;
  return !statement || statement.length < 10;
}

export function isVaguePrompt(prompt: string, type: string, statement?: string): boolean {
  if (type === "true_false" && isVagueTrueFalse(prompt, statement)) return true;
  if (/như hình vẽ|đồ thị như hình|biểu đồ sau/i.test(prompt)) return true;
  return false;
}

export function parseDiagramData(raw: unknown): DiagramData | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const diagramType = asStr(o.diagramType ?? o.type);

  if (diagramType === "graph" || o.a !== undefined || o.coefficient !== undefined) {
    const a = num(o.a ?? o.coefficient);
    if (a === undefined) return undefined;
    return { diagramType: "graph", a };
  }

  if (diagramType === "chart" || o.chartType) {
    const values = numArray(o.values);
    if (!values.length) return undefined;
    const ct = asStr(o.chartType) || "bar";
    if (!["bar", "bar_double", "pie", "line"].includes(ct)) return undefined;
    return {
      diagramType: "chart",
      chartType: ct as ChartDiagramData["chartType"],
      values,
      values2: numArray(o.values2),
      labels: strArray(o.labels),
    };
  }

  const geo = parseGeometryData(raw);
  if (geo) return { ...geo, diagramType: "geometry" };
  return undefined;
}

function buildGraphDiagram(data: GraphDiagramData): GeoGebraVisual {
  const { commands, view } = buildStableParabolaCommands(data.a);
  return { kind: "geogebra", initCommands: commands, view };
}

function buildChartDiagram(data: ChartDiagramData): GeoGebraVisual {
  const cmds: string[] = [];
  const vals = data.values;
  const labels = data.labels ?? vals.map((_, i) => String.fromCharCode(65 + i));

  if (data.chartType === "pie") {
    cmds.push(`PieChart({${vals.join(",")}})`);
  } else if (data.chartType === "line") {
    for (let i = 0; i < vals.length; i++) {
      cmds.push(`P${i + 1}=(${i},${vals[i]})`);
    }
    const pts = vals.map((_, i) => `P${i + 1}`).join(",");
    cmds.push(`Polyline(${pts})`);
  } else {
    const w = 0.8;
    for (let i = 0; i < vals.length; i++) {
      const x = i * 1.2;
      const h = vals[i]!;
      cmds.push(
        `Rect${i + 1}=Polygon((${x},0),(${x + w},0),(${x + w},${h}),(${x},${h}))`,
      );
      cmds.push(`SetCaption(Rect${i + 1}, "${labels[i]}")`);
    }
    if (data.chartType === "bar_double" && data.values2?.length) {
      for (let i = 0; i < data.values2.length; i++) {
        const x = i * 1.2 + w + 0.1;
        const h = data.values2[i]!;
        cmds.push(
          `RectB${i + 1}=Polygon((${x},0),(${x + w},0),(${x + w},${h}),(${x},${h}))`,
        );
      }
    }
  }

  const maxV = Math.max(...vals, ...(data.values2 ?? [0]), 1);
  return {
    kind: "geogebra",
    initCommands: cmds,
    view: { xmin: -1, xmax: vals.length * 1.5, ymin: -1, ymax: maxV * 1.2 },
  };
}

export function buildVisualFromDiagram(
  data: DiagramData,
  prompt: string,
): GeoGebraVisual | undefined {
  let visual: GeoGebraVisual | undefined;
  switch (data.diagramType) {
    case "graph":
      visual = buildGraphDiagram(data);
      break;
    case "chart":
      visual = buildChartDiagram(data);
      break;
    case "geometry":
    default:
      visual = buildGeoGebraFromGeometryData(data);
      break;
  }
  if (!visual?.initCommands?.length) return undefined;
  return validateGeoGebraVisual(visual, prompt);
}

export function validateDiagramForQuestion(
  prompt: string,
  type: string,
  category: string | undefined,
  diagramRaw: unknown,
): { ok: true; visual: GeoGebraVisual } | { ok: false; reason: string } {
  const needs = promptRequiresDiagram(prompt, type, category);
  if (!needs) return { ok: false, reason: "no_diagram_needed" };

  const data = parseDiagramData(diagramRaw);
  if (!data) {
    return { ok: false, reason: "Thiếu diagramData khi đề tham chiếu hình/đồ thị/biểu đồ" };
  }

  const visual = buildVisualFromDiagram(data, prompt);
  if (!visual?.initCommands?.length) {
    return { ok: false, reason: "Không dựng được hình từ diagramData" };
  }

  return { ok: true, visual };
}

function asStr(v: unknown): string {
  return String(v ?? "").trim();
}

function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function numArray(v: unknown): number[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => Number(x)).filter((n) => Number.isFinite(n));
}

function strArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? "").trim()).filter(Boolean);
}
