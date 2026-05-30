import { gradeLevelPromptContext } from "./grade-level";
import type { TraitId } from "./test-scoring";

export type AgeGroup = import("./grade-level").GradeLevelId;

export {
  GRADE_LEVELS as AGE_GROUPS,
  gradeLevelLabel as ageGroupLabel,
  type GradeLevelId,
} from "./grade-level";

export const SCHOOL_QUESTION_COUNT = 2;
export const AI_QUESTION_COUNT = 8;
export const TOTAL_QUESTIONS = SCHOOL_QUESTION_COUNT + AI_QUESTION_COUNT;

export type TestOption = {
  id: string;
  label: string;
  traits: TraitId[];
};

type SubjectDef = { label: string; traits: TraitId[] };
type ActivityDef = { label: string; traits: TraitId[] };

const SUBJECTS: Record<AgeGroup, SubjectDef[]> = {
  tieu_hoc: [
    { label: "Toán", traits: ["math", "logic"] },
    { label: "Tiếng Việt", traits: ["communication", "creative"] },
    { label: "Tiếng Anh", traits: ["communication", "logic"] },
    { label: "Tự nhiên & Xã hội", traits: ["social", "practical"] },
    { label: "Mỹ thuật", traits: ["art", "creative"] },
    { label: "Âm nhạc", traits: ["art", "creative"] },
  ],
  thcs: [
    { label: "Toán", traits: ["math", "logic"] },
    { label: "Ngữ văn", traits: ["communication", "creative"] },
    { label: "Tiếng Anh", traits: ["communication", "logic"] },
    { label: "Vật lý", traits: ["logic", "math", "practical"] },
    { label: "Hoá học", traits: ["logic", "practical"] },
    { label: "Sinh học", traits: ["social", "practical"] },
    { label: "Lịch sử", traits: ["communication", "social"] },
    { label: "Địa lý", traits: ["social", "logic"] },
  ],
  thpt: [
    { label: "Toán", traits: ["math", "logic"] },
    { label: "Ngữ văn", traits: ["communication", "creative"] },
    { label: "Tiếng Anh", traits: ["communication", "logic"] },
    { label: "Vật lý", traits: ["logic", "math", "tech"] },
    { label: "Hoá học", traits: ["logic", "practical"] },
    { label: "Sinh học", traits: ["social", "practical"] },
    { label: "Lịch sử", traits: ["communication", "social"] },
    { label: "Địa lý", traits: ["social", "logic"] },
    { label: "GDCD", traits: ["leadership", "social"] },
  ],
};

const ACTIVITIES: Record<AgeGroup, ActivityDef[]> = {
  tieu_hoc: [
    { label: "Học qua trò chơi và hoạt động vui", traits: ["creative", "social"] },
    { label: "Nghe cô giảng và làm bài tập", traits: ["logic", "practical"] },
    { label: "Thi đua nhóm với bạn trong lớp", traits: ["social", "leadership"] },
    { label: "Tự đọc sách và khám phá điều mới", traits: ["logic", "creative"] },
  ],
  thcs: [
    { label: "Làm thí nghiệm, dự án nhóm", traits: ["practical", "logic", "social"] },
    { label: "Thi đua điểm số và bài kiểm tra", traits: ["logic", "math"] },
    { label: "Tham gia câu lạc bộ, hoạt động ngoại khóa", traits: ["social", "leadership"] },
    { label: "Tự học và ôn luyện ở nhà", traits: ["logic", "practical"] },
  ],
  thpt: [
    { label: "Luyện đề, ôn thi và thi thử", traits: ["logic", "math"] },
    { label: "Làm dự án, báo cáo nhóm", traits: ["practical", "communication", "leadership"] },
    { label: "Tham gia hoạt động Đoàn, CLB", traits: ["social", "leadership"] },
    { label: "Tự nghiên cứu sâu môn mình thích", traits: ["logic", "creative"] },
  ],
};

export function getSchoolQuestion(
  index: number,
  ageGroup: AgeGroup,
): { question: string; options: TestOption[] } {
  const subjects = SUBJECTS[ageGroup];
  const activities = ACTIVITIES[ageGroup];

  if (index === 0) {
    return {
      question: "Môn học nào bạn thích nhất ở trường?",
      options: subjects.slice(0, 4).map((s, i) => ({
        id: String.fromCharCode(97 + i),
        label: s.label,
        traits: s.traits,
      })),
    };
  }

  return {
    question: "Ở trường, bạn thích cách học / hoạt động nào nhất?",
    options: activities.map((a, i) => ({
      id: String.fromCharCode(97 + i),
      label: a.label,
      traits: a.traits,
    })),
  };
}

export function ageGroupPromptContext(ageGroup: AgeGroup): string {
  return gradeLevelPromptContext(ageGroup);
}

export function inferTraitsFromText(text: string): TraitId[] {
  const t = text.toLowerCase();
  const found = new Set<TraitId>();
  const rules: [RegExp, TraitId][] = [
    [/công ngh|máy tính|lập trình|code|ai|phần mềm/, "tech"],
    [/toán|số|logic|tính toán/, "math"],
    [/logic|giải quyết|phân tích/, "logic"],
    [/vẽ|thiết kế|design|mỹ thuật|sáng tạo/, "creative"],
    [/hội hoạ|nghệ thuật|âm nhạc/, "art"],
    [/giao tiếp|thuyết trình|nói chuyện/, "communication"],
    [/lãnh đạo|điều phối|quản lý/, "leadership"],
    [/kinh doanh|bán hàng|marketing/, "business"],
    [/bạn bè|nhóm|xã hội|giúp đỡ/, "social"],
    [/thực hành|làm tay|dự án/, "practical"],
  ];
  for (const [re, trait] of rules) {
    if (re.test(t)) found.add(trait);
  }
  return found.size ? [...found] : ["logic"];
}
