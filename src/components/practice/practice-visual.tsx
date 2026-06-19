"use client";

import type { PracticeQuestion } from "@/lib/practice-types";
import { needsGeoGebra } from "@/lib/practice-visual-utils";
import { GeoGebraFigure } from "./geogebra-figure";

type Props = {
  question: PracticeQuestion;
  interactive?: boolean;
  onPick?: (x: number, y: number) => void;
  onDragUpdate?: (points: Record<string, [number, number]>) => void;
};

/** Mọi hình/đồ thị/biểu đồ → GeoGebra (engine duy nhất) */
export function PracticeVisualPanel({
  question,
  interactive,
  onPick,
  onDragUpdate,
}: Props) {
  const visual = question.visual;
  if (!visual || !needsGeoGebra(question)) return null;

  if (visual.kind === "geogebra") {
    return (
      <GeoGebraFigure
        key={question.id}
        visual={visual}
        questionKey={question.id}
        interactive={interactive}
        onPick={onPick}
        onDragUpdate={onDragUpdate}
      />
    );
  }

  return null;
}
