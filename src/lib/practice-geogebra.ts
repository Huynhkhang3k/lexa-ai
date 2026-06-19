import type { GeoGebraVisual, GeoGebraView } from "./practice-types";

const PERSPECTIVE_CMD = 'SetPerspective("G")';

function sanitizeCommand(cmd: string): string {
  return cmd.replace(/\s+/g, " ").trim();
}

function parseView(raw: Record<string, unknown> | undefined): GeoGebraView | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const xmin = Number(raw.xmin);
  const xmax = Number(raw.xmax);
  const ymin = Number(raw.ymin);
  const ymax = Number(raw.ymax);
  if (![xmin, xmax, ymin, ymax].every(Number.isFinite)) return undefined;
  if (xmax <= xmin || ymax <= ymin) return undefined;
  return { xmin, xmax, ymin, ymax };
}

export function promptNeedsGeometryVisual(prompt: string, topic: string): boolean {
  return (
    /hình học/i.test(topic) ||
    /tam giác|hình chữ nhật|hình vuông|đường tròn|hình tròn|vuông tại|góc\s*[A-Z]\s*=|∠[A-Z]/i.test(
      prompt,
    )
  );
}

/** Chuẩn hóa payload GeoGebra từ AI — không sinh hình giả */
export function validateGeoGebraVisual(
  visual: GeoGebraVisual,
  _prompt: string,
): GeoGebraVisual {
  const initCommands = visual.initCommands
    .map(sanitizeCommand)
    .filter(Boolean)
    .filter((c) => !/^SetPerspective/i.test(c));

  const labels = visual.labels?.map((l) => l.trim()).filter(Boolean);

  return {
    kind: "geogebra",
    initCommands: initCommands.length ? initCommands : visual.initCommands,
    labels: labels?.length ? labels : undefined,
    view: visual.view,
    draggable: visual.draggable?.length ? visual.draggable : undefined,
  };
}

export function buildGeoGebraLoadSequence(visual: GeoGebraVisual): string[] {
  const cmds: string[] = [PERSPECTIVE_CMD];

  if (visual.view) {
    const { xmin, xmax, ymin, ymax } = visual.view;
    cmds.push(`SetCoordSystem(${xmin}, ${xmax}, ${ymin}, ${ymax})`);
  }

  for (const cmd of visual.initCommands.map(sanitizeCommand).filter(Boolean)) {
    if (/^SetCoordSystem/i.test(cmd)) continue;
    cmds.push(cmd);
  }

  for (const label of visual.labels ?? []) {
    cmds.push(`ShowLabel(${label}, true)`);
  }

  for (const point of visual.draggable ?? []) {
    cmds.push(`SetFixed(${point}, false)`);
  }

  return cmds;
}

export function extractPointsFromCommands(
  commands: string[],
): Record<string, [number, number]> {
  const pts: Record<string, [number, number]> = {};
  const re = /^([A-Z])\s*=\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/i;
  for (const cmd of commands) {
    const m = cmd.trim().match(re);
    if (m) {
      pts[m[1]!.toUpperCase()] = [parseFloat(m[2]!), parseFloat(m[3]!)];
    }
  }
  return pts;
}

export function parseGeoGebraVisual(raw: Record<string, unknown>): GeoGebraVisual | undefined {
  const initCommands = Array.isArray(raw.initCommands)
    ? (raw.initCommands as unknown[])
        .map((c) => String(c ?? "").trim())
        .filter(Boolean)
    : [];

  if (initCommands.length === 0) return undefined;

  const labels = Array.isArray(raw.labels)
    ? (raw.labels as unknown[]).map((l) => String(l ?? "").trim()).filter(Boolean)
    : undefined;

  const draggable = Array.isArray(raw.draggable)
    ? (raw.draggable as unknown[]).map((d) => String(d ?? "").trim()).filter(Boolean)
    : undefined;

  const view = parseView(raw.view as Record<string, unknown> | undefined);

  return {
    kind: "geogebra",
    initCommands,
    labels: labels?.length ? labels : undefined,
    view,
    draggable: draggable?.length ? draggable : undefined,
  };
}
