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

export type GeoShape =
  | "triangle"
  | "right_triangle"
  | "isosceles"
  | "equilateral"
  | "rectangle"
  | "square"
  | "trapezoid"
  | "parallelogram"
  | "circle";

export type GeoVisual = {
  kind: "geo";
  shape: GeoShape;
  points: Record<string, [number, number]>;
  radius?: number;
  showLabels?: boolean;
  draggable?: string[];
};

export type SvgEdge = {
  from: string;
  to: string;
  length: number;
  unit?: string;
};

export type SvgAngle = {
  vertex: string;
  arm1: string;
  arm2: string;
  degrees: number;
  rightAngle?: boolean;
};

/** Hình tĩnh — dữ liệu từ AI, frontend vẽ SVG theo tỉ lệ thật */
export type SvgVisual = {
  kind: "svg";
  shape: GeoShape;
  /** Cạnh có độ dài — ví dụ AB=8, BC=5 */
  edges?: SvgEdge[];
  sides?: Record<string, number>;
  vertices?: string[];
  points?: Record<string, [number, number]>;
  radius?: number;
  diameter?: number;
  unit?: string;
  showLabels?: boolean;
  rightAngleAt?: string;
  angles?: SvgAngle[];
  /** Điểm phụ: H trên BC (ratio 0–1) hoặc D đối xứng A qua H */
  auxPoints?: Record<
    string,
    | { on: [string, string]; ratio: number }
    | { mirror: { of: string; through: string } }
  >;
  /** Đoạn nét đứt: đường cao, đối xứng… */
  constructionLines?: { from: string; to: string; dashed?: boolean }[];
};

export type PracticeVisual = GraphVisual | GeoVisual | SvgVisual;

export type PracticeQuestion = {
  id: string;
  type: QuestionType;
  topic: string;
  prompt: string;
  explanation: string;
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
  correct: number;
  wrong: number;
  total: number;
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
