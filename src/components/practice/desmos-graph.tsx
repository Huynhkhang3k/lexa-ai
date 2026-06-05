"use client";

import * as React from "react";
import { useScript } from "@/hooks/use-script";
import type { GraphVisual } from "@/lib/practice-types";

type DesmosCalc = {
  setExpression: (e: { id: string; latex: string }) => void;
  setMathBounds: (b: { left: number; right: number; bottom: number; top: number }) => void;
  destroy: () => void;
  observeEvent: (name: string, cb: (e: { isUserInitiated?: boolean; evaluations?: { numericValue?: number } }) => void) => void;
};

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        el: HTMLElement,
        opts?: Record<string, unknown>,
      ) => DesmosCalc;
    };
  }
}

const DESMOS_KEY = "dcb3170b442b404eb436a535b3019dcd";

type Props = {
  visual: GraphVisual;
  interactive?: boolean;
  onPick?: (x: number, y: number) => void;
  className?: string;
};

export function DesmosGraph({ visual, interactive, onPick, className }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const calcRef = React.useRef<DesmosCalc | null>(null);
  const ready = useScript(
    `https://www.desmos.com/api/v1.9/calculator.js?apiKey=${DESMOS_KEY}`,
  );

  React.useEffect(() => {
    if (!ready || !ref.current || !window.Desmos) return;
    const calc = window.Desmos.GraphingCalculator(ref.current, {
      expressions: false,
      settingsMenu: false,
      zoomButtons: true,
      lockViewport: !interactive,
      border: false,
    });
    calcRef.current = calc;

    visual.expressions.forEach((expr, i) => {
      const latex = expr.includes("=") ? expr.replace(/\^/g, "^") : expr;
      calc.setExpression({ id: `e${i}`, latex });
    });

    if (visual.bounds) {
      calc.setMathBounds(visual.bounds);
    }

    return () => {
      calc.destroy();
      calcRef.current = null;
    };
  }, [ready, visual, interactive, onPick]);

  const bounds = visual.bounds ?? { left: -10, right: 10, bottom: -10, top: 10 };

  function handleOverlayClick(ev: React.MouseEvent<HTMLButtonElement>) {
    if (!interactive || !onPick) return;
    const el = ev.currentTarget;
    const rect = el.getBoundingClientRect();
    const rx = (ev.clientX - rect.left) / rect.width;
    const ry = (ev.clientY - rect.top) / rect.height;
    const x = bounds.left + rx * (bounds.right - bounds.left);
    const y = bounds.top - ry * (bounds.top - bounds.bottom);
    onPick(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
  }

  return (
    <div
      className={className ?? "relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"}
    >
      <div ref={ref} className="h-full w-full" />
      {interactive && onPick ? (
        <button
          type="button"
          aria-label="Chọn điểm trên đồ thị"
          onClick={handleOverlayClick}
          className="absolute inset-0 z-10 cursor-crosshair bg-transparent"
        />
      ) : null}
      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-xs text-slate-500 dark:bg-black/60">
          Đang tải đồ thị…
        </div>
      ) : null}
    </div>
  );
}
