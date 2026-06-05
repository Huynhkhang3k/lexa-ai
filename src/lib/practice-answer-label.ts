import type { PracticeQuestion } from "./practice-types";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function optionLetter(index: number): string {
  return LETTERS[index] ?? String(index + 1);
}

/** Gỡ nhãn A. B. nếu AI đã gắn sẵn */
export function stripOptionPrefix(text: string): string {
  return text.replace(/^[A-Da-d]\.\s*/, "").trim();
}

export function getCorrectAnswerLabel(q: PracticeQuestion): string | null {
  switch (q.type) {
    case "mcq": {
      const idx = q.correctIndex ?? 0;
      const opt = q.options?.[idx];
      if (!opt) return null;
      return `${optionLetter(idx)}. ${stripOptionPrefix(opt)}`;
    }
    case "multi_select": {
      const parts = (q.correctIndices ?? [])
        .map((i) => {
          const o = q.options?.[i];
          return o ? `${optionLetter(i)}. ${stripOptionPrefix(o)}` : null;
        })
        .filter(Boolean);
      return parts.length ? parts.join(" · ") : null;
    }
    case "true_false":
      return q.correctBool ? "Đúng" : "Sai";
    case "fill_number":
      return q.correctValue !== undefined ? String(q.correctValue) : null;
    case "fill_sign":
      return q.correctSign ?? null;
    default:
      return null;
  }
}
