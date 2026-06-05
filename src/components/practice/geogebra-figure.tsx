"use client";

import * as React from "react";
import { useScript } from "@/hooks/use-script";
import type { GeoVisual } from "@/lib/practice-types";

type GgbApplet = {
  evalCommand: (cmd: string) => void;
  setCoordStyle: (label: string, style: number) => void;
  registerClickListener: (cb: (x: number, y: number) => void) => void;
  registerUpdateListener: (cb: () => void) => void;
  getXcoord: (name: string) => number;
  getYcoord: (name: string) => number;
};

declare global {
  interface Window {
    GGBApplet?: new (
      params: Record<string, unknown>,
      useBrowserForJS?: boolean,
    ) => { inject: (id: string) => void; getAppletObject?: () => GgbApplet };
  }
}

function buildCommands(visual: GeoVisual): string[] {
  const cmds: string[] = ["SetPerspective(\"G\")"];
  const pts = visual.points;

  for (const [name, [x, y]] of Object.entries(pts)) {
    cmds.push(`${name} = (${x}, ${y})`);
    if (visual.showLabels !== false) {
      cmds.push(`SetLabelStyle(${name}, 0)`);
      cmds.push(`ShowLabel(${name}, true)`);
    }
  }

  const names = Object.keys(pts);
  if (visual.shape === "circle" && names.length >= 1) {
    const c = names[0]!;
    const r = visual.radius ?? 3;
    cmds.push(`Circle(${c}, ${r})`);
  } else if (names.length >= 3) {
    cmds.push(`Polygon(${names.slice(0, 3).join(", ")})`);
  } else if (names.length === 2) {
    cmds.push(`Segment(${names[0]}, ${names[1]})`);
  }

  for (const d of visual.draggable ?? []) {
    cmds.push(`SetFixed(${d}, false)`);
  }

  return cmds;
}

type Props = {
  visual: GeoVisual;
  interactive?: boolean;
  onPick?: (x: number, y: number) => void;
  onDragUpdate?: (points: Record<string, [number, number]>) => void;
  className?: string;
};

export function GeoGebraFigure({ visual, interactive, onPick, onDragUpdate, className }: Props) {
  const containerId = React.useId().replace(/:/g, "");
  const appletRef = React.useRef<GgbApplet | null>(null);
  const ready = useScript("https://www.geogebra.org/apps/deployggb.js");

  React.useEffect(() => {
    if (!ready || !window.GGBApplet) return;
    const el = document.getElementById(containerId);
    if (!el) return;

    const params = {
      appName: "geometry",
      width: el.clientWidth || 480,
      height: 280,
      showToolBar: false,
      showAlgebraInput: false,
      showMenuBar: false,
      enableRightClick: false,
      enableShiftDragZoom: true,
      showResetIcon: false,
      language: "vi",
    };

    const applet = new window.GGBApplet(params, true);
    applet.inject(containerId);

    const timer = window.setTimeout(() => {
      const api = applet.getAppletObject?.();
      if (!api) return;
      appletRef.current = api;
      for (const cmd of buildCommands(visual)) {
        try {
          api.evalCommand(cmd);
        } catch {
          /* ignore invalid command */
        }
      }
      if (interactive && onPick) {
        api.registerClickListener((x, y) => {
          onPick(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
        });
      }
      if (onDragUpdate && visual.draggable?.length) {
        api.registerUpdateListener(() => {
          const pts: Record<string, [number, number]> = {};
          for (const name of visual.draggable ?? []) {
            pts[name] = [
              Math.round(api.getXcoord(name) * 10) / 10,
              Math.round(api.getYcoord(name) * 10) / 10,
            ];
          }
          onDragUpdate(pts);
        });
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [ready, visual, interactive, onPick, onDragUpdate, containerId]);

  return (
    <div
      className={className ?? "h-72 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"}
    >
      <div id={containerId} className="h-full w-full" />
      {!ready ? (
        <div className="flex h-full items-center justify-center text-xs text-slate-500">
          Đang tải hình học…
        </div>
      ) : null}
    </div>
  );
}
