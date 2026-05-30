import { gradeLevelPromptContext } from "./grade-level";

export type AgeGroup = import("./grade-level").GradeLevelId;

export {
  GRADE_LEVELS as AGE_GROUPS,
  gradeLevelLabel as ageGroupLabel,
  type GradeLevelId,
} from "./grade-level";

export const SCHOOL_QUESTION_COUNT = 2;
export const AI_QUESTION_COUNT = 8;
export const TOTAL_QUESTIONS = SCHOOL_QUESTION_COUNT + AI_QUESTION_COUNT;

const SUBJECTS: Record<AgeGroup, string[]> = {
  tieu_hoc: ["Toán", "Tiếng Việt", "Tiếng Anh", "Tự nhiên & Xã hội", "Mỹ thuật", "Âm nhạc"],
  thcs: ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lý", "Hoá học", "Sinh học", "Lịch sử", "Địa lý"],
  thpt: ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lý", "Hoá học", "Sinh học", "Lịch sử", "Địa lý", "GDCD"],
};

const ACTIVITIES: Record<AgeGroup, string[]> = {
  tieu_hoc: [
    "Học qua trò chơi và hoạt động vui",
    "Nghe cô giáo giảng và làm bài tập",
    "Thi đua nhóm với bạn trong lớp",
    "Tự đọc sách và khám phá điều mới",
  ],
  thcs: [
    "Làm thí nghiệm, dự án nhóm",
    "Thi đua điểm số và bài kiểm tra",
    "Tham gia câu lạc bộ, hoạt động ngoại khóa",
    "Tự học và ôn luyện ở nhà",
  ],
  thpt: [
    "Luyện đề, ôn thi và thi thử",
    "Làm dự án, báo cáo nhóm",
    "Tham gia hoạt động Đoàn, CLB",
    "Tự nghiên cứu sâu môn mình thích",
  ],
};

export function getSchoolQuestion(
  index: number,
  ageGroup: AgeGroup,
): { question: string; options: { id: string; label: string }[] } {
  const subjects = SUBJECTS[ageGroup];
  const activities = ACTIVITIES[ageGroup];

  if (index === 0) {
    return {
      question: "Môn học nào bạn thích nhất ở trường?",
      options: subjects.slice(0, 4).map((label, i) => ({
        id: String.fromCharCode(97 + i),
        label,
      })),
    };
  }

  return {
    question: "Ở trường, bạn thích cách học / hoạt động nào nhất?",
    options: activities.map((label, i) => ({
      id: String.fromCharCode(97 + i),
      label,
    })),
  };
}

export function ageGroupPromptContext(ageGroup: AgeGroup): string {
  return gradeLevelPromptContext(ageGroup);
}
