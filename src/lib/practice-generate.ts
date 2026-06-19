import { parseGradeNumber } from "./grade-level";
import {
  isVaguePrompt,
  parseDiagramData,
  promptRequiresDiagram,
  validateDiagramForQuestion,
} from "./practice-diagram";
import {
  fallbackExplanation,
  sanitizeExplanation,
} from "./practice-explanation";
import {
  validateCurriculumMatch,
  validateQuestionGrade,
} from "./practice-grade-guard";
import type { CurriculumSlot } from "./practice-session-planner";
import type {
  PracticeQuestion,
  QuestionCategory,
  QuestionCurriculum,
  QuestionType,
} from "./practice-types";

export type PracticeQuestionRaw = Record<string, unknown>;

const JSON_RULES = `
QUY TẮC JSON (BẮT BUỘC):
- KHÔNG dùng LaTeX, KHÔNG dùng dấu gạch chéo ngược (\\)
- Viết toán bằng Unicode: x², x³, √, π, °, ≤, ≥, ≠, △, ∥, ⊥
- Phân số dạng a/b · Chuỗi JSON hợp lệ, không xuống dòng trong text
`;

const TYPE_GUIDE = `
CÁC DẠNG CÂU:
1. mcq — 4 phương án, correctIndex 0-3
2. multi_select — correctIndices: [0,2]
3. true_false — BẮT BUỘC có "statement" (mệnh đề cụ thể). Giao diện dùng A. Đúng / B. Sai — KHÔNG dùng ✓/✗.
4. fill_number — correctValue: number
5. fill_sign — correctSign: "<"|">"|"="
6. match — matchLeft[], matchRight[], correctPairs
7. order — orderItems[], correctOrder
8. drag_drop — dragItems[], dropSlots[], correctMapping
9. graph_pick — diagramData + pickTarget (đồ thị y=ax², chỉ hệ số a)
10. geo_pick — diagramData + pickTarget
11. geo_drag — diagramData + draggable + geoDragTarget

DIAGRAM — AI KHÔNG trả SVG/HTML/initCommands. CHỈ trả diagramData:

Hình học:
{
  "diagramData": {
    "diagramType": "geometry",
    "shapeType": "rectangle",
    "labels": ["A","B","C","D"],
    "dimensions": { "AB": 8, "BC": 5 },
    "unit": "cm"
  }
}

labels PHẢI khớp tên điểm trong đề (vd. M,N,P,Q). dimensions khớp số liệu prompt (a, b, r, width, height…).

Đồ thị parabol (CHỈ hệ số a, b=0, c=0):
{
  "diagramData": { "diagramType": "graph", "a": 2 }
}

Biểu đồ:
{
  "diagramData": {
    "diagramType": "chart",
    "chartType": "bar",
    "values": [3,5,2,8],
    "labels": ["A","B","C","D"]
  }
}

Nếu prompt nhắc hình/đồ thị/biểu đồ → diagramData BẮT BUỘC.
dimensions PHẢI khớp số liệu trong prompt.

true_false ví dụ ĐÚNG:
"statement": "Hàm số đồng biến trên khoảng (-∞, 1]",
"prompt": "Xét tính đúng/sai của mệnh đề sau:",
"correctBool": true

BẮT BUỘC trả curriculum khớp slot: grade, chapter, topic, skill, category
options PHẢI là mảng chuỗi.
`;

function categoryLabel(cat: QuestionCategory): string {
  const map: Record<QuestionCategory, string> = {
    theory: "Lý thuyết (35%)",
    calculation: "Tính toán (35%)",
    geometry: "Hình học (20%)",
    real_world: "Toán thực tế (10%)",
  };
  return map[cat];
}

export function buildSingleQuestionPrompt(
  questionIndex: number,
  totalCount: number,
  selectedGrade: string,
  subject: string,
  difficulty: string,
  difficultyNote: string,
  slot: CurriculumSlot,
  rejectNote?: string,
): string {
  const gradeNum = slot.grade;
  const forbiddenNote =
    gradeNum <= 6
      ? "CẤM: Pythagore, đồng dạng, hàm số, lượng giác, logarit, đạo hàm, đường tròn lớp 9."
      : gradeNum === 7
        ? "CẤM: đồng dạng, hàm số bậc nhất, hệ PT, lượng giác, đường tròn lớp 9."
        : gradeNum === 8
          ? "CẤM: hệ thức lượng, lượng giác, hàm bậc hai, parabol lớp 9."
          : gradeNum === 9
            ? "CẤM: logarit, đạo hàm, tích phân, Oxyz."
            : gradeNum === 10
              ? "CẤM: đạo hàm, tích phân, Oxyz, số phức, bài lớp 6–7 cơ bản."
              : gradeNum === 11
                ? "CẤM: tích phân, Oxyz đầy đủ, bài lớp 6–8."
                : "CẤM: bài quá cơ bản lớp 6–8; chỉ dùng chương trình lớp 12.";

  return `Bạn là giáo viên THCS/THPT Việt Nam. Tạo ĐÚNG 1 câu luyện tập (câu ${questionIndex}/${totalCount}).
Chương trình: Kết nối tri thức với cuộc sống (Bách khoa toán 6–12).

=== SLOT CHƯƠNG TRÌNH (BẮT BUỘC TUÂN THỦ) ===
Grade: ${slot.gradeLabel}
Chapter: ${slot.chapter}
Topic: ${slot.topic}
Skill: ${slot.skill}
Category: ${categoryLabel(slot.category)}
QuestionType gợi ý: ${slot.questionType}

Môn: ${subject} · Độ khó: ${difficulty}
${difficultyNote}
${forbiddenNote}
${rejectNote ? `\n⚠️ LẦN TRƯỚC BỊ TỪ CHỐI: ${rejectNote}\nSinh lại đúng slot và đúng lớp.\n` : ""}

QUY TẮC:
- Câu hỏi PHẢI thuộc đúng Chapter → Topic → Skill ở trên
- KHÔNG sinh kiến thức vượt cấp lớp ${gradeNum}
- Mỗi câu PHẢI có ít nhất một: bối cảnh thực tế / tình huống ứng dụng / hình minh họa (diagramData)
- Mỗi câu 2-4 bước suy luận, không quá dễ, không lặp template
- KHÔNG câu mơ hồ ("phát biểu nào đúng" mà không có statement)
- Hình/đồ thị/biểu đồ: diagramData bắt buộc, khớp số liệu prompt
- options/matchLeft/matchRight: mỗi phương án là chuỗi riêng, không gộp, không trùng
${TYPE_GUIDE}
${JSON_RULES}

JSON:
{
  "question": {
    "type": "${slot.questionType}",
    "grade": "${slot.gradeLabel}",
    "chapter": "${slot.chapter}",
    "topic": "${slot.topic}",
    "skill": "${slot.skill}",
    "category": "${slot.category}",
    "prompt": "đề bài",
- explanation: 1–3 câu ngắn gọn cho học sinh, KHÔNG nhắc JSON/matchRight/diagramData/suy nghĩ nội bộ
    ...
  }
}`;
}

const VALID_TYPES = new Set<string>([
  "mcq", "multi_select", "true_false", "fill_number", "fill_sign",
  "match", "order", "drag_drop", "graph_pick", "geo_pick", "geo_drag",
]);

const VALID_CATEGORIES = new Set<string>([
  "theory",
  "calculation",
  "geometry",
  "real_world",
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

function dedupeOptions(options: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const o of options) {
    const key = o.toLowerCase().replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(o);
  }
  return out;
}

function validateMatchPairs(
  left: string[],
  right: string[],
  pairs: [number, number][],
): boolean {
  if (left.length < 2 || right.length < 2 || pairs.length < 2) return false;
  return pairs.every(
    ([l, r]) => l >= 0 && l < left.length && r >= 0 && r < right.length,
  );
}

const CONTEXT_RE =
  /thực tế|cuộc sống|mua|bán|xe|nhà|trường|vườn|công ty|km|lít|đồng|giờ|phút|chiều cao|diện tích|ứng dụng|tình huống|kịch bản|dự án|sân|hồ|cửa hàng|giá|vận tốc|nhiệt độ|lượng mưa|dân số|sản xuất|kinh doanh|xây dựng|đo đạc|bản đồ|thống kê/i;

export function questionHasContext(
  prompt: string,
  category: QuestionCategory,
  needsDiagram: boolean,
): boolean {
  if (needsDiagram || category === "geometry" || category === "real_world") return true;
  return CONTEXT_RE.test(prompt);
}

function parseCurriculum(raw: PracticeQuestionRaw): QuestionCurriculum | undefined {
  const grade = asStr(raw.grade);
  const chapter = asStr(raw.chapter);
  const topic = asStr(raw.topic);
  const skill = asStr(raw.skill);
  const category = asStr(raw.category) as QuestionCategory;
  if (!grade || !chapter || !topic || !skill) return undefined;
  if (!VALID_CATEGORIES.has(category)) return undefined;
  return { grade, chapter, topic, skill, category };
}

function parseVisual(_raw: Record<string, unknown>): PracticeQuestion["visual"] | undefined {
  return undefined;
}

function resolveVisual(
  raw: PracticeQuestionRaw,
  prompt: string,
  type: string,
  category?: string,
): PracticeQuestion["visual"] | undefined {
  const diagramRaw = raw.diagramData ?? raw.geometryData;
  const needs = promptRequiresDiagram(prompt, type, category);
  if (!needs) return undefined;

  const result = validateDiagramForQuestion(prompt, type, category, diagramRaw);
  if (result.ok) return result.visual;
  return undefined;
}

function parsePickTarget(raw: Record<string, unknown>): PracticeQuestion["pickTarget"] | undefined {
  const label = asStr(raw.label);
  const x = asNum(raw.x);
  const y = asNum(raw.y);
  if (x === undefined || y === undefined) return undefined;
  return { label: label || "Điểm", x, y, tolerance: asNum(raw.tolerance) ?? 0.8 };
}

function validateQuestionFields(
  raw: PracticeQuestionRaw,
  type: QuestionType,
): boolean {
  switch (type) {
    case "mcq": {
      const options = dedupeOptions(asStrArray(raw.options));
      return options.length >= 4;
    }
    case "multi_select":
      return dedupeOptions(asStrArray(raw.options)).length >= 4 && Array.isArray(raw.correctIndices);
    case "true_false": {
      const statement = asStr(raw.statement);
      return statement.length >= 10 && asBool(raw.correctBool) !== undefined;
    }
    case "fill_number":
      return asNum(raw.correctValue) !== undefined;
    case "fill_sign": {
      const s = asStr(raw.correctSign);
      return s === "<" || s === ">" || s === "=";
    }
    case "match": {
      const left = asStrArray(raw.matchLeft);
      const right = asStrArray(raw.matchRight);
      return validateMatchPairs(left, right, asPairs(raw.correctPairs));
    }
    case "order":
      return asStrArray(raw.orderItems).length >= 3;
    case "drag_drop":
      return asStrArray(raw.dragItems).length >= 2;
    case "graph_pick":
    case "geo_pick":
      return parsePickTarget((raw.pickTarget as Record<string, unknown>) ?? {}) !== undefined;
    case "geo_drag":
      return Boolean(raw.geoDragTarget);
    default:
      return false;
  }
}

function fillTypeFields(base: PracticeQuestion, raw: PracticeQuestionRaw, type: QuestionType) {
  switch (type) {
    case "mcq": {
      base.options = dedupeOptions(asStrArray(raw.options)).slice(0, 4);
      base.correctIndex = Math.min(Math.max(asNum(raw.correctIndex) ?? 0, 0), 3);
      break;
    }
    case "multi_select": {
      base.options = dedupeOptions(asStrArray(raw.options)).slice(0, 4);
      base.correctIndices = Array.isArray(raw.correctIndices)
        ? (raw.correctIndices as unknown[])
            .map((x) => Math.floor(Number(x)))
            .filter((n) => n >= 0 && n < 4)
        : [];
      break;
    }
    case "true_false":
      base.statement = asStr(raw.statement);
      base.correctBool = asBool(raw.correctBool);
      break;
    case "fill_number":
      base.correctValue = asNum(raw.correctValue);
      break;
    case "fill_sign":
      base.correctSign = asStr(raw.correctSign) as "<" | ">" | "=";
      break;
    case "match": {
      base.matchLeft = asStrArray(raw.matchLeft);
      base.matchRight = asStrArray(raw.matchRight);
      base.correctPairs = asPairs(raw.correctPairs);
      break;
    }
    case "order": {
      base.orderItems = asStrArray(raw.orderItems);
      base.correctOrder = Array.isArray(raw.correctOrder)
        ? (raw.correctOrder as unknown[]).map((x) => Math.floor(Number(x)))
        : [];
      break;
    }
    case "drag_drop": {
      base.dragItems = asStrArray(raw.dragItems);
      base.dropSlots = asStrArray(raw.dropSlots);
      base.correctMapping = Array.isArray(raw.correctMapping)
        ? (raw.correctMapping as unknown[]).map((x) => Math.floor(Number(x)))
        : [];
      break;
    }
    case "graph_pick":
    case "geo_pick":
      base.pickTarget = parsePickTarget((raw.pickTarget as Record<string, unknown>) ?? {});
      break;
    case "geo_drag": {
      const gdt = raw.geoDragTarget as Record<string, unknown> | undefined;
      if (gdt) {
        base.geoDragTarget = {
          point: asStr(gdt.point) || "A",
          condition: asStr(gdt.condition) || "tam giác vuông",
        };
      }
      break;
    }
  }
}

export type NormalizeContext = {
  slot: CurriculumSlot;
  questionIndex: number;
};

export function normalizeSingleQuestion(
  raw: PracticeQuestionRaw | undefined,
  ctx: NormalizeContext,
): PracticeQuestion | null {
  if (!raw) return null;
  const type = asStr(raw.type) as QuestionType;
  const prompt = asStr(raw.prompt);
  if (!VALID_TYPES.has(type) || !prompt) return null;
  if (!validateQuestionFields(raw, type)) return null;

  const statement = type === "true_false" ? asStr(raw.statement) : undefined;
  if (isVaguePrompt(prompt, type, statement)) return null;

  const curriculum = parseCurriculum(raw) ?? {
    grade: ctx.slot.gradeLabel,
    chapter: ctx.slot.chapter,
    topic: ctx.slot.topic,
    skill: ctx.slot.skill,
    category: ctx.slot.category,
  };

  const rawExplanation = asStr(raw.explanation);
  const cleanExplanation = sanitizeExplanation(rawExplanation);
  if (!cleanExplanation && rawExplanation.length > 100) return null;

  const gradeCheck = validateQuestionGrade(
    ctx.slot.gradeLabel,
    prompt,
    rawExplanation,
    curriculum.chapter,
    curriculum.topic,
  );
  if (!gradeCheck.ok) return null;

  const curriculumCheck = validateCurriculumMatch(
    ctx.slot.chapter,
    ctx.slot.topic,
    ctx.slot.skill,
    curriculum.chapter,
    curriculum.topic,
    curriculum.skill,
  );
  if (!curriculumCheck.ok) return null;

  const base: PracticeQuestion = {
    id: `q${ctx.questionIndex}`,
    type,
    topic: `${curriculum.chapter} · ${curriculum.topic}`,
    prompt,
    explanation: cleanExplanation ?? fallbackExplanation(type),
    curriculum,
  };

  fillTypeFields(base, raw, type);

  const needsDiagram = promptRequiresDiagram(prompt, type, curriculum.category);
  if (!questionHasContext(prompt, curriculum.category, needsDiagram)) return null;

  const skipDiagram =
    type === "match" ||
    type === "drag_drop" ||
    type === "order" ||
    !needsDiagram;

  if (!skipDiagram) {
    const visual = resolveVisual(raw, prompt, type, curriculum.category);
    if (!visual || visual.kind !== "geogebra") return null;
    if (type === "geo_drag" && base.geoDragTarget) {
      visual.draggable = visual.draggable ?? [base.geoDragTarget.point];
    }
    base.visual = visual;
  } else if (needsDiagram) {
    return null;
  }

  return base;
}

export function getGradeNumFromLabel(grade: string): number {
  return parseGradeNumber(grade) ?? 9;
}

// Legacy export for compatibility
export function getSuggestedTypeForIndex(index: number): QuestionType {
  const types: QuestionType[] = ["mcq", "fill_number", "true_false", "match", "multi_select"];
  return types[index % types.length] ?? "mcq";
}

export function buildPracticePrompt(
  count: number,
  selectedGrade: string,
  effectiveGrade: string,
  subject: string,
  difficulty: string,
  difficultyNote: string,
): string {
  return `Tạo ${count} câu luyện tập lớp ${selectedGrade}, môn ${subject}.
${difficultyNote}
${TYPE_GUIDE}
${JSON_RULES}`;
}

export function normalizePracticeQuestions(
  batch: PracticeQuestionRaw[],
  startIndex: number,
): PracticeQuestion[] {
  return [];
}
