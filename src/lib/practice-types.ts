export type QuestionCategory = "theory" | "calculation" | "geometry" | "real_world";

export type QuestionCurriculum = {
  grade: string;
  chapter: string;
  topic: string;
  skill: string;
  category: QuestionCategory;
};

export type QuestionType =
  | "mcq"
  | "multi_select"
  | "true_false"
  | "fill_number"
  | "fill_sign"
  | "match"
  | "order"
  | "drag_drop"
  | "graph_pick"
  | "geo_pick"
  | "geo_drag";

export type GraphVisual = {
  kind: "graph";
  expressions: string[];
  bounds?: { left: number; right: number; bottom: number; top: number };
};

export type GeoGebraView = {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
};

/** Hình học — AI chỉ trả lệnh GeoGebra, frontend evalCommand */
export type GeoGebraVisual = {
  kind: "geogebra";
  initCommands: string[];
  labels?: string[];
  view?: GeoGebraView;
  draggable?: string[];
};

export type PracticeVisual = GeoGebraVisual;

export type PracticeQuestion = {
  id: string;
  type: QuestionType;
  topic: string;
  prompt: string;
  /** Mệnh đề rõ ràng cho true_false */
  statement?: string;
  explanation: string;
  curriculum?: QuestionCurriculum;
  visual?: PracticeVisual;
  options?: string[];
  correctIndex?: number;
  correctIndices?: number[];
  correctBool?: boolean;
  correctValue?: number;
  correctSign?: "<" | ">" | "=";
  matchLeft?: string[];
  matchRight?: string[];
  correctPairs?: [number, number][];
  orderItems?: string[];
  correctOrder?: number[];
  dragItems?: string[];
  dropSlots?: string[];
  correctMapping?: number[];
  pickTarget?: { label: string; x: number; y: number; tolerance?: number };
  geoDragTarget?: { point: string; condition: string };
};

export type PracticeAnswer =
  | { type: "mcq"; index: number }
  | { type: "multi_select"; indices: number[] }
  | { type: "true_false"; value: boolean }
  | { type: "fill_number"; value: number }
  | { type: "fill_sign"; value: "<" | ">" | "=" }
  | { type: "match"; pairs: [number, number][] }
  | { type: "order"; order: number[] }
  | { type: "drag_drop"; mapping: number[] }
  | { type: "graph_pick"; x: number; y: number }
  | { type: "geo_pick"; x: number; y: number }
  | { type: "geo_drag"; points: Record<string, [number, number]> };

export type PracticeSessionMeta = {
  sessionId: string;
  grade: string;
  subject: string;
  difficulty: string;
  count: number;
  timeLimitSec: number;
  effectiveGrade?: string;
};

export type PracticeSessionResult = {
  /** Tổng số câu của đề (20/30) */
  totalQuestions: number;
  correctAnswers: number;
  /** Chỉ câu đã trả lời nhưng sai */
  wrongAnswers: number;
  unansweredQuestions: number;
  answeredQuestions: number;
  /** Không đạt = total - correct (sai + chưa làm) */
  notCorrect: number;
  /** Phần trăm: (correct / total) × 100 */
  finalScore: number;
  /** @deprecated alias */
  correct: number;
  wrong: number;
  total: number;
  answered: number;
  unanswered: number;
  accuracy: number;
  scorePercent: number;
  durationMs: number;
  strengths: string[];
  weaknesses: string[];
  topicsReview: string[];
  knowledgeGaps: string[];
};

export const QUESTION_TYPES: QuestionType[] = [
  "mcq",
  "multi_select",
  "true_false",
  "fill_number",
  "fill_sign",
  "match",
  "order",
  "drag_drop",
  "graph_pick",
  "geo_pick",
  "geo_drag",
];

export const PRACTICE_COUNTS = [20, 30] as const;
export type PracticeCount = (typeof PRACTICE_COUNTS)[number];

export function timeLimitForCount(count: PracticeCount): number {
  return count === 20 ? 20 * 60 : 30 * 60;
}
