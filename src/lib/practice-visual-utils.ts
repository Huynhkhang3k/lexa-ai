import type { PracticeQuestion, QuestionType } from "./practice-types";

/** Hình tĩnh → SVG React. Chỉ geo_drag mới cần GeoGebra */
export function needsGeoGebra(q: PracticeQuestion): boolean {
  return q.type === "geo_drag";
}

export function needsDesmos(q: PracticeQuestion): boolean {
  return q.visual?.kind === "graph" || q.type === "graph_pick";
}

function promptNeedsFigure(q: PracticeQuestion): boolean {
  return (
    /hình học/i.test(q.topic) ||
    /tam giác|hình chữ nhật|hình vuông|đường tròn|hình tròn|vuông tại|góc\s*[A-Z]\s*=|∠[A-Z]/i.test(
      q.prompt,
    )
  );
}

export function needsSvg(q: PracticeQuestion): boolean {
  if (!q.visual) return false;
  if (q.type === "match" || q.type === "order" || q.type === "drag_drop") {
    if (!promptNeedsFigure(q)) return false;
  }
  if (q.visual.kind === "svg") return true;
  if (q.visual.kind === "geo" && !needsGeoGebra(q)) return true;
  return false;
}

const ROTATION: QuestionType[] = [
  "mcq",
  "fill_number",
  "true_false",
  "match",
  "mcq",
  "fill_sign",
  "multi_select",
  "order",
  "mcq",
  "drag_drop",
  "fill_number",
  "mcq",
  "true_false",
  "match",
  "mcq",
  "fill_number",
  "multi_select",
  "order",
  "mcq",
  "drag_drop",
  "mcq",
  "fill_number",
  "true_false",
  "match",
  "mcq",
  "fill_sign",
  "multi_select",
  "order",
  "mcq",
  "drag_drop",
];

export function suggestedQuestionType(index: number): QuestionType {
  return ROTATION[index % ROTATION.length] ?? "mcq";
}
