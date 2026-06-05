import type { PracticeAnswer, PracticeQuestion } from "./practice-types";

export function hasAnswer(q: PracticeQuestion, answer: PracticeAnswer | undefined): boolean {
  if (!answer || answer.type !== q.type) return false;
  switch (answer.type) {
    case "mcq":
      return answer.index >= 0;
    case "multi_select":
      return answer.indices.length >= 1;
    case "true_false":
      return true;
    case "fill_number":
      return Number.isFinite(answer.value);
    case "fill_sign":
      return true;
    case "match":
      return answer.pairs.length >= (q.matchLeft?.length ?? 0);
    case "order":
      return answer.order.length === (q.orderItems?.length ?? 0);
    case "drag_drop":
      return answer.mapping.every((m: number) => m >= 0);
    case "graph_pick":
    case "geo_pick":
      return Number.isFinite(answer.x) && Number.isFinite(answer.y);
    case "geo_drag":
      return Object.keys(answer.points).length > 0;
    default:
      return false;
  }
}
