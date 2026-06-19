import { parseGradeNumber } from "./grade-level";

export type GradeGuardResult = { ok: true } | { ok: false; reason: string };

/** Kiến thức CẤM theo lớp — nếu xuất hiện trong prompt/explanation → REJECT */
const FORBIDDEN_BY_GRADE: Record<number, RegExp[]> = {
  6: [
    /pythagore|pitago|pytagore/i,
    /đồng dạng/i,
    /\bhàm số\b/i,
    /lượng giác|\bsin\b|\bcos\b|\btan\b|\bcot\b/i,
    /logarit|\bln\b|\blog\b/i,
    /đạo hàm|tích phân|vi phân/i,
    /hệ phương trình/i,
    /phương trình bậc hai|pt bậc hai/i,
    /parabol|y\s*=\s*ax²/i,
    /hệ thức lượng/i,
    /tiếp tuyến.*đường tròn|góc nội tiếp/i,
  ],
  7: [
    /pythagore|pitago|pytagore/i,
    /đồng dạng/i,
    /hàm số bậc nhất|y\s*=\s*ax\s*\+/i,
    /hệ phương trình/i,
    /lượng giác|\bsin\b|\bcos\b|\btan\b/i,
    /hệ thức lượng/i,
    /phương trình bậc hai/i,
    /parabol|y\s*=\s*ax²/i,
    /logarit|đạo hàm|tích phân/i,
  ],
  8: [
    /hệ thức lượng/i,
    /lượng giác|\bsin\b|\bcos\b|\btan\b/i,
    /hàm số bậc hai|y\s*=\s*ax²|parabol/i,
    /phương trình bậc hai/i,
    /hệ phương trình/i,
    /logarit|đạo hàm|tích phân/i,
  ],
  9: [
    /logarit|\bln\b/i,
    /đạo hàm|tích phân|vi phân/i,
    /giới hạn hàm số/i,
    /Oxyz|tọa độ không gian/i,
  ],
  10: [
    /tích phân|vi phân|đạo hàm/i,
    /Oxyz|tọa độ không gian|hệ trục 3 chiều/i,
    /số phức|complex number/i,
    /lượng giác nâng cao|hệ thức lượng/i,
    /tập hợp số tự nhiên cơ bản|phép cộng trong tập N|lớp 6/i,
    /đồng dạng tam giác/i,
  ],
  11: [
    /tích phân|integral/i,
    /Oxyz|tọa độ không gian|mặt phẳng \(Oxy\)/i,
    /tập hợp số tự nhiên cơ bản|phạm vi lớp 6|phạm vi lớp 7/i,
  ],
  12: [
    /tập hợp số tự nhiên cơ bản|phạm vi lớp 6|phạm vi lớp 7|phạm vi lớp 8/i,
    /phép cộng hai số tự nhiên/i,
  ],
};

function textToCheck(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function validateQuestionGrade(
  gradeLabel: string,
  prompt: string,
  explanation: string,
  chapter?: string,
  topic?: string,
): GradeGuardResult {
  const gradeNum = parseGradeNumber(gradeLabel);
  if (!gradeNum) return { ok: true };

  const forbidden = FORBIDDEN_BY_GRADE[gradeNum];
  if (!forbidden?.length) return { ok: true };

  const haystack = textToCheck([prompt, explanation, chapter, topic]);
  for (const re of forbidden) {
    if (re.test(haystack)) {
      return {
        ok: false,
        reason: `Kiến thức vượt cấp hoặc sai lớp ${gradeNum}: phát hiện "${re.source}" trong đề bài`,
      };
    }
  }

  return { ok: true };
}

/** Kiểm tra câu hỏi có khớp slot chương trình đã chọn */
export function validateCurriculumMatch(
  slotChapter: string,
  slotTopic: string,
  slotSkill: string,
  aiChapter: string,
  aiTopic: string,
  aiSkill: string,
): GradeGuardResult {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const prefixMatch = (a: string, b: string, len: number) => {
    const na = norm(a);
    const nb = norm(b);
    const slice = Math.min(len, na.length, nb.length);
    if (slice < 3) return na === nb;
    return na.includes(nb.slice(0, slice)) || nb.includes(na.slice(0, slice));
  };

  const cOk = prefixMatch(aiChapter, slotChapter, 6);
  const tOk = prefixMatch(aiTopic, slotTopic, 5);
  const sOk = prefixMatch(aiSkill, slotSkill, 4);

  if (!cOk || !tOk || !sOk) {
    return {
      ok: false,
      reason: `Chủ đề không khớp slot: cần "${slotChapter} → ${slotTopic} → ${slotSkill}"`,
    };
  }
  return { ok: true };
}
