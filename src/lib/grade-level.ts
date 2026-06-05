export type GradeLevelId = "tieu_hoc" | "thcs" | "thpt";

export const GRADE_LEVEL_STORAGE_KEY = "lexa-grade-level";

export const GRADE_LEVELS: {
  id: GradeLevelId;
  label: string;
  hint: string;
  gradeRange: string;
  minGrade: number;
  maxGrade: number;
}[] = [
  {
    id: "tieu_hoc",
    label: "Tiểu học",
    hint: "Lớp 1–5",
    gradeRange: "lớp 1–5",
    minGrade: 1,
    maxGrade: 5,
  },
  {
    id: "thcs",
    label: "THCS",
    hint: "Lớp 6–9",
    gradeRange: "lớp 6–9",
    minGrade: 6,
    maxGrade: 9,
  },
  {
    id: "thpt",
    label: "THPT",
    hint: "Lớp 10–12",
    gradeRange: "lớp 10–12",
    minGrade: 10,
    maxGrade: 12,
  },
];

export function gradeLevelLabel(id: GradeLevelId): string {
  return GRADE_LEVELS.find((g) => g.id === id)?.label ?? id;
}

export function parseGradeNumber(grade: string): number | null {
  const m = grade.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

export function gradeLevelPromptContext(id: GradeLevelId): string {
  const group = GRADE_LEVELS.find((g) => g.id === id);
  if (!group) return "học sinh Việt Nam";

  if (id === "tieu_hoc") {
    return `học sinh tiểu học (${group.gradeRange}). Dùng từ rất dễ hiểu, ví dụ gần gũi. KHÔNG hỏi về nghề nghiệp, đại học hay áp lực thi cử.`;
  }
  if (id === "thcs") {
    return `học sinh THCS (${group.gradeRange}). Ngôn ngữ đơn giản, tránh thuật ngữ khó. Gợi ý nghề mang tính khám phá sở thích.`;
  }
  return `học sinh THPT (${group.gradeRange}). Có thể hỏi sâu về định hướng ngành học và nghề nghiệp tương lai.`;
}

export function englishLevelContext(id: GradeLevelId): string {
  if (id === "tieu_hoc") {
    return "Tiếng Anh cơ bản (Pre-A1/A1): từ vựng và cấu trúc rất đơn giản, câu ngắn.";
  }
  if (id === "thcs") {
    return "Tiếng Anh trình độ A2 (THCS): từ vựng phổ thông, cấu trúc câu trung bình, tránh idioms khó.";
  }
  return "Tiếng Anh trình độ B1–B2 (THPT): có thể dùng từ vựng phong phú hơn, cấu trúc phức tạp, idioms phổ biến.";
}

export function chatAssistantContext(id: GradeLevelId): string {
  const base = gradeLevelPromptContext(id);
  const eng = englishLevelContext(id);

  if (id === "tieu_hoc") {
    return `${base}
- Trả lời ngắn gọn, dùng ví dụ đời sống hàng ngày.
- Toán: chỉ dùng công thức và phép tính trong chương trình lớp 1–5.
- Tiếng Anh: ${eng}`;
  }
  if (id === "thcs") {
    return `${base}
- Trả lời đầy đủ, có thể viết bài mẫu/hội thoại/đoạn văn khi học sinh yêu cầu.
- Toán/Lý/Hóa: giải thích và làm bài kèm các bước rõ ràng.
- Tiếng Anh: ${eng}`;
  }
  return `${base}
- Trả lời chi tiết, phân tích sâu; hoàn thành trọn vẹn bài viết, hội thoại, luận điểm khi được yêu cầu.
- Toán/Lý/Hóa: dùng công thức và kiến thức THPT (lớp 10–12), có thể liên hệ đề thi THPTQG.
- Tiếng Anh: ${eng}`;
}

export function practiceDifficultyContext(
  userLevel: GradeLevelId,
  selectedGrade: string,
  selectedDifficulty: string,
): { effectiveGrade: string; difficultyNote: string } {
  const selected = parseGradeNumber(selectedGrade) ?? 10;
  const profile = GRADE_LEVELS.find((g) => g.id === userLevel)!;
  let target = selected;

  if (profile.maxGrade > selected) {
    const gap = profile.maxGrade - selected;
    target = Math.min(12, selected + Math.max(2, Math.ceil(gap * 0.6)));
  }

  if (selectedDifficulty === "Dễ") {
    target = Math.max(target, selected + 1);
  } else if (selectedDifficulty === "Trung bình") {
    target = Math.max(target, selected + 2);
  } else {
    target = Math.max(target, selected + 3);
  }

  target = Math.min(12, target);

  const difficultyNote =
    profile.maxGrade > selected
      ? `Học sinh khối ${profile.label} chọn luyện ${selectedGrade} — đề phải KHÓ HƠN mức lớp ${selectedGrade}, tương đương nội dung lớp ${target} trở lên. Câu hỏi mang tính thử thách, không quá dễ.`
      : `Đề luyện tập lớp ${selectedGrade}, độ khó "${selectedDifficulty}" — câu hỏi phải thực sự thử thách, tránh câu quá cơ bản. Mức độ tương đương lớp ${target}.`;

  return {
    effectiveGrade: `Lớp ${target}`,
    difficultyNote,
  };
}

export function isValidGradeLevel(value: string | null): value is GradeLevelId {
  return value === "tieu_hoc" || value === "thcs" || value === "thpt";
}
