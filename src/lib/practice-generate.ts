import { parseGradeNumber } from "./grade-level";
import { promptNeedsGeometryVisual, validateSvgVisual } from "./practice-geometry";
import { suggestedQuestionType } from "./practice-visual-utils";
import type { GeoShape, PracticeQuestion, QuestionType, SvgAngle, SvgEdge, SvgVisual } from "./practice-types";

export type PracticeQuestionRaw = Record<string, unknown>;

const JSON_RULES = `
QUY TẮC JSON (BẮT BUỘC):
- KHÔNG dùng LaTeX, KHÔNG dùng dấu gạch chéo ngược (\\)
- Viết toán bằng Unicode: x², x³, √, π, °, ≤, ≥, ≠, △, ∥, ⊥
- Phân số dạng a/b · Chuỗi JSON hợp lệ, không xuống dòng trong text
`;

const TYPE_GUIDE = `
CÁC DẠNG CÂU (phân bổ ngẫu nhiên, mỗi batch đủ nhiều dạng):
1. mcq — 4 phương án A/B/C/D, correctIndex 0-3
2. multi_select — chọn nhiều đáp án, correctIndices: [0,2]
3. true_false — một mệnh đề, correctBool: true/false
4. fill_number — điền số tự nhiên/số nguyên, correctValue: number
5. fill_sign — điền dấu < > =, correctSign: "<"|">"|"="
6. match — matchLeft[], matchRight[], correctPairs: [[0,1],[1,0]]
7. order — orderItems[], correctOrder: [2,0,1]
8. drag_drop — dragItems[], dropSlots[], correctMapping: [1,0,2]
9. graph_pick — visual.kind=graph, expressions:["y=x^2-4x+3"], pickTarget:{label,x,y,tolerance}
10. geo_pick — visual.kind=geo, click đỉnh/điểm, pickTarget:{label,x,y}
11. geo_drag — visual.kind=geo, draggable:["A"], geoDragTarget:{point:"A",condition:"tam giác vuông"}

VISUAL — BẮT BUỘC khớp đề bài, KHÔNG hình mẫu cố định:
- Hình học tĩnh: visual.kind="svg" với đủ dữ kiện:
  {
    "kind":"svg",
    "shape":"right_triangle"|"rectangle"|"square"|"isosceles"|"equilateral"|"circle"|...,
    "unit":"cm",
    "edges":[{"from":"A","to":"B","length":6},{"from":"A","to":"C","length":8}],
    "rightAngleAt":"A",
    "vertices":["A","B","C"],
    "auxPoints":{"H":{"on":["B","C"],"ratio":0.4}}
  }
- Hình chữ nhật AB=8, BC=5 → edges AB:8 và BC:5 (KHÔNG vuông)
- Hình vuông cạnh 4 → 4 cạnh đều length:4, shape:"square"
- Tam giác cân AB=AC → edges AB và AC bằng nhau
- Đồ thị: visual.kind="graph", expressions:["y=2x+1"]
- CHỈ geo_drag mới dùng kind:"geo" với draggable
- options PHẢI là mảng chuỗi ["A. 12 cm","B. 14 cm",...] KHÔNG phải object
`;

function mathTopicGuide(gradeNum: number): string {
  if (gradeNum <= 6) return "phân số, tỉ lệ, chu vi/diện tích, thống kê cơ bản";
  if (gradeNum <= 8) return "phương trình, hình học tam giác/đường tròn, thể tích";
  if (gradeNum <= 10) return "PT bậc hai, Oxy, lượng giác, xác suất, hình không gian";
  return "đạo hàm, cực trị, lượng giác, hình không gian, xác suất";
}

function subjectAddon(subject: string, grade: string, count: number): string {
  const gradeNum = parseGradeNumber(grade) ?? 10;
  if (subject !== "Toán") {
    return `
- Bám chương trình VN môn ${subject}, lớp ${grade}
- Ưu tiên bài vận dụng thực tế, nhiều bước suy luận
- Không quá dễ (tránh câu 1 bước trừ lớp 1-3)
`;
  }
  return `
MÔN TOÁN:
- Chương trình lớp ${grade}: ${mathTopicGuide(gradeNum)}
- Ưu tiên bối cảnh thực tế (mua bán, giao thông, thống kê)
- Hình học quan sát → visual.kind=svg (KHÔNG geo)
- KHÔNG tạo 3+5=? hay phép tính 1 bước
- Mỗi câu 2-4 bước suy luận
`;
}

export function buildSingleQuestionPrompt(
  questionIndex: number,
  totalCount: number,
  selectedGrade: string,
  effectiveGrade: string,
  subject: string,
  difficulty: string,
  difficultyNote: string,
  suggestedType: QuestionType,
  previousTopics: string[],
): string {
  const topicAvoid =
    previousTopics.length > 0
      ? `Tránh lặp chủ đề: ${previousTopics.slice(-5).join(", ")}.`
      : "";

  return `Bạn là giáo viên THCS/THPT Việt Nam. Tạo ĐÚNG 1 câu luyện tập (câu ${questionIndex}/${totalCount}), AI sáng tác mới.
- Lớp: ${selectedGrade} · Nội dung: ${effectiveGrade}
- Môn: ${subject} · Độ khó: ${difficulty}
${difficultyNote}
${subjectAddon(subject, selectedGrade, 1)}
${TYPE_GUIDE}
${topicAvoid}
Gợi ý dạng câu: ${suggestedType} (có thể đổi nếu hợp lý hơn).
- CHỈ thêm visual khi bài THẬT SỰ cần hình (hình học). Bài ghép cặp đại số KHÔNG cần hình.
- Nếu có visual.kind=svg: edges phải khớp CHÍNH XÁC số liệu trong prompt.
${JSON_RULES}

CHỈ 1 câu trong JSON:
{
  "question": {
    "type": "${suggestedType}",
    "topic": "Đại số",
    "prompt": "đề bài",
    "explanation": "giải thích ngắn",
    ...
  }
}`;
}

export function buildPracticePrompt(
  count: number,
  selectedGrade: string,
  effectiveGrade: string,
  subject: string,
  difficulty: string,
  difficultyNote: string,
  typeHint?: string,
): string {
  return `Bạn là giáo viên THCS/THPT Việt Nam. Tạo đúng ${count} câu luyện tập THỬ THÁCH, AI sáng tác 100%.
- Lớp: ${selectedGrade} · Nội dung thực tế: ${effectiveGrade} (khó hơn lớp chọn)
- Môn: ${subject} · Độ khó: ${difficulty}
${difficultyNote}
${subjectAddon(subject, selectedGrade, count)}
${TYPE_GUIDE}
${typeHint ?? ""}
${JSON_RULES}

Mỗi câu có: id, type, topic (vd: "Hình học","Đại số","Thống kê","Vận dụng"), prompt, explanation (≤2 câu).
Trường theo type — chỉ điền trường cần thiết.

JSON:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "topic": "Vận dụng",
      "prompt": "Một cửa hàng...",
      "options": ["A. ...","B. ...","C. ...","D. ..."],
      "correctIndex": 0,
      "explanation": "..."
    }
  ]
}`;
}

const VALID_TYPES = new Set<string>([
  "mcq", "multi_select", "true_false", "fill_number", "fill_sign",
  "match", "order", "drag_drop", "graph_pick", "geo_pick", "geo_drag",
]);

function asStr(v: unknown): string {
  return String(v ?? "").trim();
}

function asNum(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function asBool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

function normalizeOptionText(x: unknown): string {
  if (typeof x === "string") return x.trim();
  if (typeof x === "number" && Number.isFinite(x)) return String(x);
  if (x && typeof x === "object" && !Array.isArray(x)) {
    const o = x as Record<string, unknown>;
    if (typeof o.text === "string") return o.text.trim();
    if (typeof o.label === "string") return o.label.trim();
    if (typeof o.value === "string") return o.value.trim();
    if (typeof o.value === "number" && Number.isFinite(o.value)) return String(o.value);
    if (typeof o.content === "string") return o.content.trim();
    if (typeof o.answer === "string") return o.answer.trim();
    if (typeof o.answer === "number" && Number.isFinite(o.answer)) return String(o.answer);
  }
  return "";
}

function asStrArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => normalizeOptionText(x) || asStr(x)).filter(Boolean);
}

function asPairs(v: unknown): [number, number][] {
  if (!Array.isArray(v)) return [];
  return v
    .map((p) => {
      if (!Array.isArray(p) || p.length < 2) return null;
      return [Math.floor(Number(p[0])), Math.floor(Number(p[1]))] as [number, number];
    })
    .filter((p): p is [number, number] => p !== null);
}

function parseVisual(raw: Record<string, unknown>): PracticeQuestion["visual"] | undefined {
  const kind = asStr(raw.kind);
  if (kind === "graph") {
    const expressions = asStrArray(raw.expressions);
    if (expressions.length === 0) return undefined;
    const b = raw.bounds as Record<string, unknown> | undefined;
    return {
      kind: "graph",
      expressions,
      bounds: b
        ? {
            left: asNum(b.left) ?? -10,
            right: asNum(b.right) ?? 10,
            bottom: asNum(b.bottom) ?? -10,
            top: asNum(b.top) ?? 10,
          }
        : undefined,
    };
  }
  if (kind === "svg") {
    const shapes = new Set([
      "triangle", "right_triangle", "isosceles", "equilateral",
      "rectangle", "square", "trapezoid", "parallelogram", "circle",
    ]);
    const shape = asStr(raw.shape);
    const sides: Record<string, number> = {};
    const rawSides = raw.sides as Record<string, unknown> | undefined;
    if (rawSides && typeof rawSides === "object") {
      for (const [k, v] of Object.entries(rawSides)) {
        const n = asNum(v);
        if (n !== undefined) sides[k] = n;
      }
    }
    const points: Record<string, [number, number]> = {};
    const rawPts = raw.points as Record<string, unknown> | undefined;
    if (rawPts && typeof rawPts === "object") {
      for (const [k, v] of Object.entries(rawPts)) {
        if (Array.isArray(v) && v.length >= 2) {
          points[k] = [Number(v[0]), Number(v[1])];
        }
      }
    }
    const edges: SvgEdge[] = [];
    if (Array.isArray(raw.edges)) {
      for (const e of raw.edges) {
        if (!e || typeof e !== "object") continue;
        const edge = e as Record<string, unknown>;
        const from = asStr(edge.from);
        const to = asStr(edge.to);
        const length = asNum(edge.length);
        if (from && to && length !== undefined) {
          edges.push({
            from,
            to,
            length,
            unit: asStr(edge.unit) || undefined,
          });
        }
      }
    }

    const angles: SvgAngle[] = [];
    if (Array.isArray(raw.angles)) {
      for (const a of raw.angles) {
        if (!a || typeof a !== "object") continue;
        const ang = a as Record<string, unknown>;
        const vertex = asStr(ang.vertex);
        const arm1 = asStr(ang.arm1);
        const arm2 = asStr(ang.arm2);
        const degrees = asNum(ang.degrees);
        if (vertex && arm1 && arm2 && degrees !== undefined) {
          angles.push({
            vertex,
            arm1,
            arm2,
            degrees,
            rightAngle: ang.rightAngle === true || degrees === 90,
          });
        }
      }
    }

    const auxPoints: SvgVisual["auxPoints"] = {};
    const rawAux = raw.auxPoints as Record<string, unknown> | undefined;
    if (rawAux && typeof rawAux === "object") {
      for (const [name, spec] of Object.entries(rawAux)) {
        if (!spec || typeof spec !== "object") continue;
        const s = spec as Record<string, unknown>;
        const on = s.on;
        if (Array.isArray(on) && on.length >= 2) {
          auxPoints[name] = {
            on: [asStr(on[0]), asStr(on[1])],
            ratio: asNum(s.ratio) ?? 0.5,
          };
          continue;
        }
        const mirror = s.mirror as Record<string, unknown> | undefined;
        if (mirror && typeof mirror === "object") {
          const of = asStr(mirror.of);
          const through = asStr(mirror.through);
          if (of && through) {
            auxPoints[name] = { mirror: { of, through } };
          }
        }
      }
    }

    const constructionLines: SvgVisual["constructionLines"] = [];
    if (Array.isArray(raw.constructionLines)) {
      for (const line of raw.constructionLines) {
        if (!line || typeof line !== "object") continue;
        const l = line as Record<string, unknown>;
        const from = asStr(l.from);
        const to = asStr(l.to);
        if (from && to) {
          constructionLines.push({
            from,
            to,
            dashed: l.dashed !== false,
          });
        }
      }
    }

    const vertices = Array.isArray(raw.vertices)
      ? (raw.vertices as unknown[]).map((x) => asStr(x)).filter(Boolean)
      : undefined;

    return {
      kind: "svg",
      shape: (shapes.has(shape) ? shape : "triangle") as GeoShape,
      edges: edges.length ? edges : undefined,
      sides: Object.keys(sides).length ? sides : undefined,
      points: Object.keys(points).length ? points : undefined,
      vertices,
      radius: asNum(raw.radius),
      diameter: asNum(raw.diameter),
      unit: asStr(raw.unit) || "cm",
      showLabels: raw.showLabels !== false,
      rightAngleAt: asStr(raw.rightAngleAt) || undefined,
      angles: angles.length ? angles : undefined,
      auxPoints: Object.keys(auxPoints).length ? auxPoints : undefined,
      constructionLines: constructionLines.length ? constructionLines : undefined,
    };
  }
  if (kind === "geo") {
    const points: Record<string, [number, number]> = {};
    const rawPts = raw.points as Record<string, unknown> | undefined;
    if (rawPts && typeof rawPts === "object") {
      for (const [k, v] of Object.entries(rawPts)) {
        if (Array.isArray(v) && v.length >= 2) {
          points[k] = [Number(v[0]), Number(v[1])];
        }
      }
    }
    if (Object.keys(points).length < 2 && !raw.radius) return undefined;
    const shapes = new Set([
      "triangle", "right_triangle", "isosceles", "equilateral",
      "rectangle", "square", "trapezoid", "parallelogram", "circle",
    ]);
    const shape = asStr(raw.shape);
    return {
      kind: "geo",
      shape: (shapes.has(shape) ? shape : "triangle") as GeoShape,
      points,
      radius: asNum(raw.radius),
      showLabels: raw.showLabels !== false,
      draggable: asStrArray(raw.draggable),
    };
  }
  return undefined;
}

function parsePickTarget(raw: Record<string, unknown>): PracticeQuestion["pickTarget"] | undefined {
  const label = asStr(raw.label);
  const x = asNum(raw.x);
  const y = asNum(raw.y);
  if (x === undefined || y === undefined) return undefined;
  return { label: label || "Điểm", x, y, tolerance: asNum(raw.tolerance) ?? 0.8 };
}

export function normalizePracticeQuestions(
  batch: PracticeQuestionRaw[],
  startIndex: number,
): PracticeQuestion[] {
  const out: PracticeQuestion[] = [];

  for (let i = 0; i < batch.length; i++) {
    const raw = batch[i]!;
    const type = asStr(raw.type) as QuestionType;
    const prompt = asStr(raw.prompt);
    if (!VALID_TYPES.has(type) || !prompt) continue;

    const base: PracticeQuestion = {
      id: `q${startIndex + out.length + 1}`,
      type,
      topic: asStr(raw.topic) || "Tổng hợp",
      prompt,
      explanation: asStr(raw.explanation) || "Xem lại các bước giải tương ứng.",
    };

    const visual = raw.visual && typeof raw.visual === "object"
      ? parseVisual(raw.visual as Record<string, unknown>)
      : undefined;
    if (visual) base.visual = visual;

    let valid = false;

    switch (type) {
      case "mcq": {
        const options = asStrArray(raw.options);
        if (options.length >= 4) {
          base.options = options.slice(0, 4);
          base.correctIndex = Math.min(Math.max(asNum(raw.correctIndex) ?? 0, 0), 3);
          valid = true;
        }
        break;
      }
      case "multi_select": {
        const options = asStrArray(raw.options);
        const fromArr = Array.isArray(raw.correctIndices)
          ? (raw.correctIndices as unknown[])
              .map((x) => Math.floor(Number(x)))
              .filter((n) => n >= 0 && n < 4)
          : [];
        const indices = fromArr;
        if (options.length >= 4 && indices.length >= 1) {
          base.options = options.slice(0, 4);
          base.correctIndices = [...new Set(indices)].slice(0, 3);
          valid = true;
        }
        break;
      }
      case "true_false": {
        const cb = asBool(raw.correctBool);
        if (cb !== undefined) {
          base.correctBool = cb;
          valid = true;
        }
        break;
      }
      case "fill_number": {
        const cv = asNum(raw.correctValue);
        if (cv !== undefined) {
          base.correctValue = cv;
          valid = true;
        }
        break;
      }
      case "fill_sign": {
        const s = asStr(raw.correctSign);
        if (s === "<" || s === ">" || s === "=") {
          base.correctSign = s;
          valid = true;
        }
        break;
      }
      case "match": {
        const left = asStrArray(raw.matchLeft);
        const right = asStrArray(raw.matchRight);
        const pairs = asPairs(raw.correctPairs);
        if (left.length >= 2 && right.length >= 2 && pairs.length >= 2) {
          base.matchLeft = left;
          base.matchRight = right;
          base.correctPairs = pairs;
          valid = true;
        }
        break;
      }
      case "order": {
        const items = asStrArray(raw.orderItems);
        const order = Array.isArray(raw.correctOrder)
          ? (raw.correctOrder as unknown[]).map((x) => Math.floor(Number(x)))
          : [];
        if (items.length >= 3 && order.length === items.length) {
          base.orderItems = items;
          base.correctOrder = order;
          valid = true;
        }
        break;
      }
      case "drag_drop": {
        const drag = asStrArray(raw.dragItems);
        const slots = asStrArray(raw.dropSlots);
        const mapping = Array.isArray(raw.correctMapping)
          ? (raw.correctMapping as unknown[]).map((x) => Math.floor(Number(x)))
          : [];
        if (drag.length >= 2 && slots.length >= 2 && mapping.length === drag.length) {
          base.dragItems = drag;
          base.dropSlots = slots;
          base.correctMapping = mapping;
          valid = true;
        }
        break;
      }
      case "graph_pick":
      case "geo_pick": {
        const pt = parsePickTarget(
          (raw.pickTarget as Record<string, unknown>) ?? {},
        );
        if (pt && visual) {
          base.pickTarget = pt;
          valid = true;
        }
        break;
      }
      case "geo_drag": {
        const gdt = raw.geoDragTarget as Record<string, unknown> | undefined;
        if (visual?.kind === "geo" && gdt) {
          base.geoDragTarget = {
            point: asStr(gdt.point) || "A",
            condition: asStr(gdt.condition) || "tam giác vuông",
          };
          if (visual.draggable?.length) valid = true;
          else if (visual.kind === "geo") {
            (visual as { draggable?: string[] }).draggable = [base.geoDragTarget.point];
            valid = true;
          }
        }
        break;
      }
    }

    if (valid) out.push(base);
  }

  return out;
}

export function normalizeSingleQuestion(
  raw: PracticeQuestionRaw | undefined,
  questionIndex: number,
): PracticeQuestion | null {
  if (!raw) return null;
  const batch = normalizePracticeQuestions([raw], questionIndex - 1);
  const q = batch[0];
  if (!q) return null;

  const needsFigure = promptNeedsGeometryVisual(q.prompt, q.topic);
  const skipVisual =
    !needsFigure ||
    q.type === "match" ||
    q.type === "drag_drop" ||
    q.type === "order";

  let visual = skipVisual ? undefined : q.visual;

  if (visual?.kind === "svg") {
    visual = validateSvgVisual(visual, q.prompt);
  } else if (!visual && needsFigure && q.type !== "match" && q.type !== "drag_drop" && q.type !== "order") {
    visual = validateSvgVisual(
      { kind: "svg", shape: "triangle", unit: "cm" },
      q.prompt,
    );
  }

  return { ...q, id: `q${questionIndex}`, visual };
}

export function getSuggestedTypeForIndex(index: number): QuestionType {
  return suggestedQuestionType(index);
}
