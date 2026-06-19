import type { PracticeQuestion } from "./practice-types";

function promptNeedsFigure(q: PracticeQuestion): boolean {
  return (
    /hình học/i.test(q.topic) ||
    /tam giác|hình chữ nhật|hình vuông|đường tròn|hình tròn|vuông tại|góc\s*[A-Z]\s*=|∠[A-Z]/i.test(
      q.prompt,
    )
  );
}

/** GeoGebra cho mọi diagram (hình học, đồ thị y=ax², biểu đồ) */
export function needsGeoGebra(q: PracticeQuestion): boolean {
  if (q.visual?.kind !== "geogebra") return false;
  if (q.type === "match" || q.type === "order" || q.type === "drag_drop") {
    return promptNeedsFigure(q);
  }
  return true;
}

/** @deprecated Desmos đã thay bằng GeoGebra */
export function needsDesmos(_q: PracticeQuestion): boolean {
  return false;
}
