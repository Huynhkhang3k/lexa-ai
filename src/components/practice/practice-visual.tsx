"use client";

import type { PracticeQuestion } from "@/lib/practice-types";
import { needsDesmos, needsGeoGebra, needsSvg } from "@/lib/practice-visual-utils";
import { DesmosGraph } from "./desmos-graph";
import { GeoGebraFigure } from "./geogebra-figure";
import { PracticeSvgFigure } from "./practice-svg-figure";

type Props = {
  question: PracticeQuestion;
  interactive?: boolean;
  onPick?: (x: number, y: number) => void;
  onDragUpdate?: (points: Record<string, [number, number]>) => void;
};

export function PracticeVisualPanel({
  question,
  interactive,
  onPick,
  onDragUpdate,
}: Props) {
  const visual = question.visual;
  if (!visual) return null;

  if (needsSvg(question) && visual.kind === "svg") {
    return (
      <PracticeSvgFigure
        visual={visual}
        prompt={question.prompt}
        interactive={interactive}
        onPick={onPick}
      />
    );
  }

  if (needsSvg(question) && visual.kind === "geo") {
    const svgVisual = {
      kind: "svg" as const,
      shape: visual.shape,
      points: visual.points,
      radius: visual.radius,
      showLabels: visual.showLabels,
      unit: "cm" as const,
    };
    return (
      <PracticeSvgFigure
        visual={svgVisual}
        prompt={question.prompt}
        interactive={interactive}
        onPick={onPick}
      />
    );
  }

  if (needsDesmos(question) && visual.kind === "graph") {
    return (
      <DesmosGraph visual={visual} interactive={interactive} onPick={onPick} />
    );
  }

  if (needsGeoGebra(question) && visual.kind === "geo") {
    return (
      <GeoGebraFigure
        visual={visual}
        interactive={interactive}
        onPick={onPick}
        onDragUpdate={onDragUpdate}
      />
    );
  }

  return null;
}
