import type { GradeLevelId } from "./grade-level";
import { gradeLevelLabel } from "./grade-level";

export type RoadmapStep = {
  label: string;
  focus: string;
  isGoal?: boolean;
};

const ROADMAP_TEMPLATES: Record<string, RoadmapStep[]> = {
  "ai-eng": [
    { label: "Nền tảng Toán & Tin", focus: "Củng cố tư duy logic và thuật toán cơ bản" },
    { label: "Python", focus: "Ngôn ngữ lập trình cho AI và data" },
    { label: "Toán nâng cao", focus: "Xác suất, đại số, thống kê" },
    { label: "Cấu trúc dữ liệu", focus: "Thuật toán và tối ưu hoá" },
    { label: "Machine Learning", focus: "Học máy và mô hình AI" },
    { label: "Portfolio dự án", focus: "Dự án thực tế trên GitHub" },
    { label: "Thực tập", focus: "Kinh nghiệm tại doanh nghiệp công nghệ" },
    { label: "Kỹ sư AI", focus: "Mục tiêu nghề nghiệp", isGoal: true },
  ],
  se: [
    { label: "Tin học & Logic", focus: "Tư duy giải bài toán bằng code" },
    { label: "HTML/CSS/JS", focus: "Nền tảng web" },
    { label: "Lập trình hướng đối tượng", focus: "Cấu trúc chương trình chuyên nghiệp" },
    { label: "Framework hiện đại", focus: "React, Node hoặc mobile" },
    { label: "Git & làm việc nhóm", focus: "Quy trình phát triển phần mềm" },
    { label: "Portfolio", focus: "2–3 dự án hoàn chỉnh" },
    { label: "Kỹ sư phần mềm", focus: "Mục tiêu nghề nghiệp", isGoal: true },
  ],
  da: [
    { label: "Toán & Thống kê", focus: "Nền tảng phân tích số liệu" },
    { label: "Excel & SQL", focus: "Truy vấn và báo cáo dữ liệu" },
    { label: "Python/R cho phân tích", focus: "Xử lý và trực quan hoá" },
    { label: "Business Intelligence", focus: "Dashboard và insight kinh doanh" },
    { label: "Dự án thực tế", focus: "Case study từ dữ liệu mở" },
    { label: "Data Analyst", focus: "Mục tiêu nghề nghiệp", isGoal: true },
  ],
  ux: [
    { label: "Nền tảng thiết kế", focus: "Bố cục, màu sắc, typography" },
    { label: "Figma", focus: "Wireframe và prototype" },
    { label: "UX Research", focus: "Phỏng vấn và test người dùng" },
    { label: "Design System", focus: "Thiết kế nhất quán cho sản phẩm" },
    { label: "Portfolio UI/UX", focus: "3 case study chất lượng" },
    { label: "Thiết kế UI/UX", focus: "Mục tiêu nghề nghiệp", isGoal: true },
  ],
  default: [
    { label: "Khám phá bản thân", focus: "Hoàn thành đánh giá và xác định điểm mạnh" },
    { label: "Chọn chuyên môn", focus: "Tìm hiểu ngành phù hợp trên thư viện nghề" },
    { label: "Học kỹ năng nền", focus: "Môn học và kỹ năng cốt lõi" },
    { label: "Luyện tập & dự án", focus: "Áp dụng qua LEXA và dự án cá nhân" },
    { label: "Định hướng nghề", focus: "Mục tiêu nghề nghiệp", isGoal: true },
  ],
};

export function buildRoadmap(careerId: string, careerName: string, grade: GradeLevelId): RoadmapStep[] {
  const base = ROADMAP_TEMPLATES[careerId] ?? ROADMAP_TEMPLATES.default;
  const gradeLabel = gradeLevelLabel(grade);

  if (careerId === "default" || !ROADMAP_TEMPLATES[careerId]) {
    return [
      { label: gradeLabel, focus: "Bắt đầu từ khối lớp hiện tại" },
      ...base.map((s) => ({ ...s, label: s.isGoal ? careerName : s.label })),
    ];
  }

  return [{ label: gradeLabel, focus: "Xuất phát từ trình độ hiện tại" }, ...base];
}
