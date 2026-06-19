"use client";

import * as React from "react";
import { useScript } from "@/hooks/use-script";
import { buildGeoGebraLoadSequence } from "@/lib/practice-geogebra";
import { STABLE_COORD_VIEW } from "@/lib/practice-geometry-engine";
import type { GeoGebraVisual } from "@/lib/practice-types";

const GGB_SCRIPT = "https://www.geogebra.org/apps/deployggb.js";
const GGB_SIZE = 600;

type GgbApplet = {
  evalCommand: (cmd: string) => void;
  reset?: () => void;
  setCoordSystem: (xmin: number, xmax: number, ymin: number, ymax: number) => void;
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

function lockView(api: GgbApplet, visual: GeoGebraVisual) {
  const v = visual.view ?? STABLE_COORD_VIEW;
  try {
    api.setCoordSystem(v.xmin, v.xmax, v.ymin, v.ymax);
  } catch {
    /* ignore */
  }
}

/** reset sạch — khớp prototype HTML */
function clearGraph(api: GgbApplet) {
  if (typeof api.reset === "function") {
    api.reset();
    return;
  }
  try {
    api.evalCommand("DeleteAllObjects()");
  } catch {
    /* ignore */
  }
}

function applyCommands(api: GgbApplet, visual: GeoGebraVisual) {
  lockView(api, visual);
  for (const cmd of buildGeoGebraLoadSequence(visual)) {
    if (/^SetCoordSystem/i.test(cmd)) continue;
    try {
      api.evalCommand(cmd);
    } catch {
      /* skip invalid command */
    }
  }
}

type Props = {
  visual: GeoGebraVisual;
  questionKey: string;
  interactive?: boolean;
  onPick?: (x: number, y: number) => void;
  onDragUpdate?: (points: Record<string, [number, number]>) => void;
  className?: string;
};

export function GeoGebraFigure({
  visual,
  questionKey,
  interactive,
  onPick,
  onDragUpdate,
  className,
}: Props) {
  const containerId = React.useId().replace(/:/g, "");
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const appletRef = React.useRef<GgbApplet | null>(null);
  const readyRef = React.useRef(false);
  const visualRef = React.useRef(visual);
  visualRef.current = visual;

  const applyCurrentVisual = React.useCallback((api: GgbApplet) => {
    clearGraph(api);
    applyCommands(api, visualRef.current);
  }, []);

  const ready = useScript(GGB_SCRIPT);

  const mountApplet = React.useCallback(() => {
    if (!ready || !window.GGBApplet) return;
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = "";
    readyRef.current = false;
    appletRef.current = null;

    const size = Math.min(wrapperRef.current?.clientWidth ?? GGB_SIZE, GGB_SIZE);

    const params: Record<string, unknown> = {
      appName: "classic",
      width: size,
      height: size,
      showToolBar: false,
      showAlgebraInput: false,
      showMenuBar: false,
      enableRightClick: false,
      enableShiftDragZoom: true,
      showResetIcon: false,
      language: "vi",
      appletOnLoad: (api: GgbApplet) => {
        appletRef.current = api;
        readyRef.current = true;
        api.setCoordSystem(
          STABLE_COORD_VIEW.xmin,
          STABLE_COORD_VIEW.xmax,
          STABLE_COORD_VIEW.ymin,
          STABLE_COORD_VIEW.ymax,
        );
        applyCurrentVisual(api);

        if (interactive && onPick) {
          api.registerClickListener((x, y) => {
            onPick(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
          });
        }

        if (onDragUpdate && visualRef.current.draggable?.length) {
          api.registerUpdateListener(() => {
            const pts: Record<string, [number, number]> = {};
            for (const name of visualRef.current.draggable ?? []) {
              pts[name] = [
                Math.round(api.getXcoord(name) * 10) / 10,
                Math.round(api.getYcoord(name) * 10) / 10,
              ];
            }
            onDragUpdate(pts);
          });
        }
      },
    };

    const applet = new window.GGBApplet(params, true);
    applet.inject(containerId);

    const fallback = window.setTimeout(() => {
      if (readyRef.current) return;
      const api = applet.getAppletObject?.();
      if (!api) return;
      appletRef.current = api;
      readyRef.current = true;
      api.setCoordSystem(
        STABLE_COORD_VIEW.xmin,
        STABLE_COORD_VIEW.xmax,
        STABLE_COORD_VIEW.ymin,
        STABLE_COORD_VIEW.ymax,
      );
      applyCurrentVisual(api);
    }, 1200);

    return () => window.clearTimeout(fallback);
  }, [ready, containerId, interactive, onPick, onDragUpdate, applyCurrentVisual]);

  React.useEffect(() => {
    const cleanupTimer = mountApplet();
    const el = document.getElementById(containerId);
    return () => {
      cleanupTimer?.();
      readyRef.current = false;
      appletRef.current = null;
      if (el) el.innerHTML = "";
    };
  }, [mountApplet, containerId]);

  React.useEffect(() => {
    const api = appletRef.current;
    if (!api || !readyRef.current) return;
    applyCurrentVisual(api);
  }, [questionKey, visual, applyCurrentVisual]);

  return (
    <div
      ref={wrapperRef}
      className={
        className ??
        "relative mx-auto aspect-square w-full max-w-[600px] overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"
      }
    >
      <div id={containerId} className="h-full w-full bg-white dark:bg-slate-900/30" />
      {!ready ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-500">
          Đang tải GeoGebra…
        </div>
      ) : null}
    </div>
  );
}
