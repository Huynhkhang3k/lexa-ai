import type { PracticeAnswer, PracticeQuestion } from "./practice-types";
import { extractPointsFromCommands } from "./practice-geogebra";

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

function pairsEqual(a: [number, number][], b: [number, number][]): boolean {
  if (a.length !== b.length) return false;
  const norm = (pairs: [number, number][]) =>
    pairs
      .map(([l, r]) => `${l}:${r}`)
      .sort()
      .join("|");
  return norm(a) === norm(b);
}

function near(a: number, b: number, tol = 0.6): boolean {
  return Math.abs(a - b) <= tol;
}

export function isAnswerCorrect(q: PracticeQuestion, answer: PracticeAnswer | undefined): boolean {
  if (!answer) return false;

  switch (q.type) {
    case "mcq":
      return answer.type === "mcq" && answer.index === q.correctIndex;
    case "multi_select":
      return (
        answer.type === "multi_select" &&
        sameSet(answer.indices, q.correctIndices ?? [])
      );
    case "true_false":
      return answer.type === "true_false" && answer.value === q.correctBool;
    case "fill_number":
      return (
        answer.type === "fill_number" &&
        typeof q.correctValue === "number" &&
        Math.abs(answer.value - q.correctValue) < 0.01
      );
    case "fill_sign":
      return answer.type === "fill_sign" && answer.value === q.correctSign;
    case "match":
      return (
        answer.type === "match" && pairsEqual(answer.pairs, q.correctPairs ?? [])
      );
    case "order": {
      if (answer.type !== "order" || !q.correctOrder) return false;
      return (
        answer.order.length === q.correctOrder.length &&
        answer.order.every((v, i) => v === q.correctOrder![i])
      );
    }
    case "drag_drop": {
      if (answer.type !== "drag_drop" || !q.correctMapping) return false;
      return (
        answer.mapping.length === q.correctMapping.length &&
        answer.mapping.every((v, i) => v === q.correctMapping![i])
      );
    }
    case "graph_pick":
    case "geo_pick": {
      if (answer.type !== "graph_pick" && answer.type !== "geo_pick") return false;
      const t = q.pickTarget;
      if (!t) return false;
      const tol = t.tolerance ?? 0.8;
      return near(answer.x, t.x, tol) && near(answer.y, t.y, tol);
    }
    case "geo_drag": {
      if (answer.type !== "geo_drag" || !q.geoDragTarget || q.visual?.kind !== "geogebra") {
        return false;
      }
      const pts = answer.points;
      const target = q.geoDragTarget.point;
      const moved = pts[target];
      if (!moved) return false;
      const cond = q.geoDragTarget.condition.toLowerCase();
      if (cond.includes("vuông") || cond.includes("90")) {
        const base = extractPointsFromCommands(q.visual.initCommands);
        const all = { ...base, ...pts };
        const keys = Object.keys(all);
        if (keys.length < 3) return false;
        const [a, b, c] = keys.slice(0, 3).map((k) => all[k]!);
        const ab = [b[0] - a[0], b[1] - a[1]];
        const ac = [c[0] - a[0], c[1] - a[1]];
        const dot = ab[0] * ac[0] + ab[1] * ac[1];
        return Math.abs(dot) < 0.5;
      }
      return near(moved[0], q.pickTarget?.x ?? moved[0], 1.2);
    }
    default:
      return false;
  }
}
