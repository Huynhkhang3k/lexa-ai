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

export const SCHOOL_OTHER_OPTION_ID = "other";

export type SchoolQuestion = {
  question: string;
  options: TestOption[];
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
    { label: "Khoa học (Hóa, Lý, Sinh)", traits: ["logic", "math", "practical"] },
    { label: "Lịch sử", traits: ["communication", "social"] },
    { label: "Địa lý", traits: ["social", "logic"] },
    { label: "Tin học", traits: ["tech", "logic"] },
    { label: "Mỹ thuật", traits: ["art", "creative"] },
    { label: "Thể dục", traits: ["social", "practical"] },
  ],
  thpt: [
    { label: "Toán", traits: ["math", "logic"] },
    { label: "Ngữ văn", traits: ["communication", "creative"] },
    { label: "Tiếng Anh", traits: ["communication", "logic"] },
    { label: "Khoa học (Hóa, Lý, Sinh)", traits: ["logic", "math", "practical"] },
    { label: "Lịch sử", traits: ["communication", "social"] },
    { label: "Địa lý", traits: ["social", "logic"] },
    { label: "GDCD", traits: ["leadership", "social"] },
    { label: "Tin học", traits: ["tech", "logic"] },
    { label: "Giáo dục kinh tế & Pháp luật", traits: ["business", "communication"] },
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

function subjectOptionsForQ1(ageGroup: AgeGroup): TestOption[] {
  const subjects = SUBJECTS[ageGroup];
  const pick =
    ageGroup === "tieu_hoc"
      ? subjects
      : [
          subjects.find((s) => s.label === "Toán")!,
          subjects.find((s) => s.label.startsWith("Ngữ") || s.label === "Tiếng Việt")!,
          subjects.find((s) => s.label === "Tiếng Anh") ?? subjects[2]!,
          subjects.find((s) => s.label.startsWith("Khoa học")) ??
            subjects.find((s) => s.label === "Tự nhiên & Xã hội")!,
        ].filter(Boolean);

  const options = pick.slice(0, 4).map((s, i) => ({
    id: String.fromCharCode(97 + i),
    label: s.label,
    traits: s.traits,
  }));

  options.push({
    id: SCHOOL_OTHER_OPTION_ID,
    label: "Môn khác (tự viết)",
    traits: [],
  });

  return options;
}

function activityOptionsForQ2(ageGroup: AgeGroup): TestOption[] {
  const activities = ACTIVITIES[ageGroup];
  const options = activities.map((a, i) => ({
    id: String.fromCharCode(97 + i),
    label: a.label,
    traits: a.traits,
  }));

  options.push({
    id: SCHOOL_OTHER_OPTION_ID,
    label: "Khác (tự viết)",
    traits: [],
  });

  return options;
}

export function getSchoolQuestion(index: number, ageGroup: AgeGroup): SchoolQuestion {
  if (index === 0) {
    return {
      question: "Môn học nào bạn thích nhất ở trường?",
      options: subjectOptionsForQ1(ageGroup),
    };
  }

  return {
    question: "Ở trường, bạn thích cách học / hoạt động nào nhất?",
    options: activityOptionsForQ2(ageGroup),
  };
}

export function ageGroupPromptContext(ageGroup: AgeGroup): string {
  return gradeLevelPromptContext(ageGroup);
}

export function inferTraitsFromText(text: string): TraitId[] {
  const t = text.toLowerCase().normalize("NFC");
  const found = new Set<TraitId>();

  const careContext = /chăm sóc|y tế|bệnh|bác sĩ|điều dưỡng|giúp đỡ|giúp ích|tình nguyện|tỉ mỉ|bình tĩnh/.test(t);

  const rules: [RegExp, TraitId][] = [
    [/lập trình|code|phần mềm|máy tính|game|công nghệ số/, "tech"],
    [/hóa|lý|sinh|khoa học|thí nghiệm|tự nhiên/, "practical"],
    [/toán|số|tính toán/, "math"],
    [/logic|giải quyết|phân tích/, "logic"],
    [/vẽ|thiết kế|design|mỹ thuật|sáng tạo/, "creative"],
    [/hội hoạ|nghệ thuật|âm nhạc/, "art"],
    [/giao tiếp|thuyết trình|nói chuyện|dạy|tư vấn/, "communication"],
    [/lãnh đạo|điều phối|quản lý/, "leadership"],
    [/kinh doanh|bán hàng|marketing/, "business"],
    [/bạn bè|nhóm|xã hội|giúp đỡ|giúp ích|cộng đồng/, "social"],
    [/thực hành|làm tay|dự án/, "practical"],
  ];

  for (const [re, trait] of rules) {
    if (re.test(t)) found.add(trait);
  }

  // "Lắp ráp" đơn lẻ → thực hành; chỉ gắn tech khi có ngữ cảnh máy móc / lập trình
  if (/lắp ráp|lắp ghép/.test(t)) {
    found.add("practical");
    if (!careContext && /máy|kỹ thuật|cơ khí|robot|điện/.test(t)) {
      found.add("logic");
    }
  }

  if (careContext) {
    found.add("social");
    if (/tỉ mỉ|cẩn thận/.test(t)) found.add("practical");
  }

  return [...found];
}

const FALLBACK_AI: { question: string; options: TestOption[] }[] = [
  {
    question: "Khi gặp bài khó, bạn thường làm gì?",
    options: [
      { id: "a", label: "Tìm cách giải từng bước cho đến khi hiểu", traits: ["logic", "math"] },
      { id: "b", label: "Hỏi bạn hoặc thầy cô để được giải thích", traits: ["communication", "social"] },
      { id: "c", label: "Tìm video hoặc tài liệu trên mạng", traits: ["tech", "logic"] },
      { id: "d", label: "Thử cách sáng tạo, vẽ sơ đồ hoặc ghi chú màu", traits: ["creative", "design"] },
    ],
  },
  {
    question: "Hoạt động ngoài giờ học nào bạn thích nhất?",
    options: [
      { id: "a", label: "Chơi thể thao hoặc vận động ngoài trời", traits: ["social", "practical"] },
      { id: "b", label: "Đọc sách, viết lách hoặc làm nghệ thuật", traits: ["creative", "communication"] },
      { id: "c", label: "Làm việc nhóm, tổ chức sự kiện", traits: ["leadership", "social"] },
      { id: "d", label: "Chơi game, lập trình hoặc tìm hiểu công nghệ", traits: ["tech", "logic"] },
    ],
  },
  {
    question: "Bạn cảm thấy hứng thú nhất khi làm việc như thế nào?",
    options: [
      { id: "a", label: "Một mình, tập trung suy nghĩ sâu", traits: ["logic", "math"] },
      { id: "b", label: "Cùng nhóm, trao đổi ý kiến", traits: ["communication", "social"] },
      { id: "c", label: "Thực hành tay, làm thí nghiệm hoặc dự án", traits: ["practical", "logic"] },
      { id: "d", label: "Sáng tạo ý tưởng mới, thiết kế hoặc trình bày", traits: ["creative", "design"] },
    ],
  },
  {
    question: "Môi trường làm việc nào bạn thấy phù hợp nhất?",
    options: [
      { id: "a", label: "Văn phòng có quy trình rõ ràng", traits: ["logic", "business"] },
      { id: "b", label: "Studio, phòng sáng tạo hoặc làm việc tự do", traits: ["creative", "design"] },
      { id: "c", label: "Bệnh viện, trường học hoặc nơi giúp đỡ người khác", traits: ["social", "communication"] },
      { id: "d", label: "Phòng lab, xưởng kỹ thuật hoặc công ty công nghệ", traits: ["tech", "practical"] },
    ],
  },
  {
    question: "Điều gì khiến bạn tự hào nhất về bản thân?",
    options: [
      { id: "a", label: "Giải được bài toán hoặc câu đố khó", traits: ["math", "logic"] },
      { id: "b", label: "Thuyết trình hay diễn đạt ý tưởng rõ ràng", traits: ["communication", "leadership"] },
      { id: "c", label: "Tạo ra sản phẩm đẹp hoặc ý tưởng độc đáo", traits: ["creative", "art"] },
      { id: "d", label: "Giúp bạn bè hoặc làm việc nhóm hiệu quả", traits: ["social", "leadership"] },
    ],
  },
  {
    question: "Bạn thích loại công việc nào hơn?",
    options: [
      { id: "a", label: "Phân tích số liệu, lập kế hoạch", traits: ["math", "business"] },
      { id: "b", label: "Thiết kế, vẽ hoặc làm nội dung", traits: ["design", "creative"] },
      { id: "c", label: "Lập trình, sửa máy hoặc làm kỹ thuật", traits: ["tech", "practical"] },
      { id: "d", label: "Tư vấn, dạy học hoặc chăm sóc người khác", traits: ["communication", "social"] },
    ],
  },
  {
    question: "Khi có thời gian rảnh, bạn thường làm gì?",
    options: [
      { id: "a", label: "Xem video học tập hoặc đọc sách chuyên môn", traits: ["logic", "tech"] },
      { id: "b", label: "Vẽ, chụp ảnh, làm nhạc hoặc viết", traits: ["art", "creative"] },
      { id: "c", label: "Ra ngoài gặp bạn, tham gia hoạt động cộng đồng", traits: ["social", "leadership"] },
      { id: "d", label: "Chơi game chiến thuật hoặc tìm hiểu công nghệ mới", traits: ["tech", "logic"] },
    ],
  },
  {
    question: "Điều gì quan trọng nhất với bạn trong tương lai?",
    options: [
      { id: "a", label: "Ổn định tài chính và phát triển sự nghiệp", traits: ["business", "logic"] },
      { id: "b", label: "Được sáng tạo và làm việc mình yêu thích", traits: ["creative", "design"] },
      { id: "c", label: "Giúp ích cho xã hội và mọi người xung quanh", traits: ["social", "communication"] },
      { id: "d", label: "Khám phá, đổi mới và làm việc với công nghệ", traits: ["tech", "practical"] },
    ],
  },
];

/** Câu hỏi dự phòng khi AI tạm không phản hồi */
export function getFallbackAiQuestion(aiIndex: number): { question: string; options: TestOption[] } {
  const idx = Math.max(0, Math.min(aiIndex - 1, FALLBACK_AI.length - 1));
  return FALLBACK_AI[idx]!;
}
