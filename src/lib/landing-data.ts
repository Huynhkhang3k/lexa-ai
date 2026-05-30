import type { LucideIcon } from "lucide-react";
import {
  Bot,
  Compass,
  Heart,
  Lightbulb,
  PenLine,
  Route,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

export type JourneyStep = {
  label: string;
  desc: string;
  icon: LucideIcon;
  href?: string;
};

export const LEXA_JOURNEY: JourneyStep[] = [
  {
    label: "Khám phá bản thân",
    desc: "Làm bài test tính cách và sở thích",
    icon: Compass,
    href: "/test",
  },
  {
    label: "Nhận phân tích điểm mạnh",
    desc: "Hiểu rõ thế mạnh và phong cách học",
    icon: Sparkles,
    href: "/test",
  },
  {
    label: "Nhận gợi ý nghề nghiệp",
    desc: "Ngành nghề phù hợp với bạn",
    icon: Target,
    href: "/library",
  },
  {
    label: "Khám phá lộ trình phát triển",
    desc: "Roadmap từng bước đến mục tiêu",
    icon: Route,
    href: "#roadmap",
  },
  {
    label: "Học cùng AI",
    desc: "Trợ lý giải bài, ôn tập thông minh",
    icon: Bot,
    href: "/chat",
  },
  {
    label: "Luyện tập kỹ năng",
    desc: "Bài tập được tạo theo khối lớp",
    icon: PenLine,
    href: "/practice",
  },
  {
    label: "Xây dựng tương lai",
    desc: "Theo dõi tiến độ và mục tiêu dài hạn",
    icon: TrendingUp,
    href: "#progress",
  },
];

export const CAREER_ROADMAP_DEMO = {
  goal: "AI Engineer",
  goalVi: "Kỹ sư AI",
  steps: [
    { grade: "Lớp 10", focus: "Nền tảng & định hướng" },
    { grade: "Python", focus: "Ngôn ngữ lập trình cơ bản" },
    { grade: "Toán nâng cao", focus: "Đại số, xác suất thống kê" },
    { grade: "Data Structures", focus: "Cấu trúc dữ liệu & thuật toán" },
    { grade: "Machine Learning", focus: "Học máy & mô hình AI" },
    { grade: "Portfolio cá nhân", focus: "Dự án thực tế trên GitHub" },
    { grade: "Thực tập", focus: "Kinh nghiệm tại doanh nghiệp" },
    { grade: "AI Engineer", focus: "Mục tiêu nghề nghiệp", isGoal: true },
  ],
} as const;

export const SAMPLE_ANALYSIS = {
  studentLabel: "Kết quả phân tích mẫu",
  strengths: ["Tư duy logic", "Khả năng tự học", "Yêu thích công nghệ"],
  careers: ["Kỹ sư phần mềm", "Data Analyst", "Kỹ sư AI / Học máy"],
  learningStyle: "Học qua thực hành, thích giải quyết vấn đề cụ thể",
  matchScore: 92,
};

export const DEMO_PROFILE = {
  name: "Minh An",
  grade: "Lớp 10 · THCS",
  avatarInitials: "MA",
  strengths: ["Tư duy logic", "Tự học tốt", "Yêu công nghệ"],
  matchedCareer: "Kỹ sư AI / Học máy",
  skillsToDevelop: ["Python", "Toán nâng cao", "Tư duy thuật toán"],
  careerGoal: "Trở thành AI Engineer tại công ty công nghệ hàng đầu Việt Nam",
  progress: 68,
};

export const PROGRESS_METRICS = [
  { label: "Hoàn thành đánh giá bản thân", value: 100, color: "bg-sky-500" },
  { label: "Khám phá nghề nghiệp", value: 80, color: "bg-violet-500" },
  { label: "Luyện tập kỹ năng", value: 40, color: "bg-fuchsia-500" },
  { label: "Mục tiêu tương lai", value: 60, color: "bg-blue-500" },
] as const;

export const TRUST_FACTORS = [
  {
    title: "Dựa trên sở thích",
    desc: "Phân tích cách bạn phản hồi trong bài test và hoạt động thực tế trên nền tảng.",
    icon: Heart,
  },
  {
    title: "Dựa trên năng lực",
    desc: "Đánh giá điểm mạnh học tập, kỹ năng đã thể hiện qua luyện tập và trợ lý AI.",
    icon: Lightbulb,
  },
  {
    title: "Dựa trên phong cách học tập",
    desc: "Nhận diện bạn học tốt qua lý thuyết, thực hành hay dự án — rồi điều chỉnh gợi ý.",
    icon: Sparkles,
  },
  {
    title: "Dựa trên mục tiêu nghề nghiệp",
    desc: "Gắn lộ trình phát triển với ngành nghề bạn hướng tới, phù hợp bối cảnh Việt Nam.",
    icon: Target,
  },
] as const;

export const CAREER_PREVIEW_DEMO = {
  id: "ai-eng",
  name: "Kỹ sư AI / Học máy",
  tagline: "Dạy máy học từ dữ liệu",
  highlight: "Triển vọng cao",
  description:
    "Xây dựng mô hình học máy, ứng dụng AI và computer vision. Phù hợp học sinh mạnh Toán, Tin và thích thử nghiệm công nghệ mới.",
  averageSalary: "25–80 triệu/tháng (VN)",
  outlook: "Nhu cầu tăng mạnh tại startup AI, big tech và doanh nghiệp chuyển đổi số",
  skills: ["Python", "Toán & thống kê", "Deep learning", "Tư duy thử nghiệm"],
  relatedSubjects: ["Toán", "Tin học", "Tiếng Anh", "Vật lý"],
  studyPath: "Lớp 10–12: Python + Toán nâng cao → ĐH: CNTT/AI → Portfolio + thực tập",
  technologies: ["Python", "TensorFlow", "PyTorch", "Jupyter", "Git"],
};

export const ECOSYSTEM_PILLARS = [
  {
    title: "Khám phá bản thân",
    items: ["Bài test tính cách", "Phân tích điểm mạnh", "Gợi ý lộ trình"],
    href: "/test",
    step: "01",
  },
  {
    title: "Học tập thông minh",
    items: ["Trợ lý AI", "Luyện tập", "Dịch thuật"],
    href: "/chat",
    step: "02",
  },
  {
    title: "Phát triển tương lai",
    items: ["Thư viện nghề", "Career Roadmap", "Theo dõi tiến độ"],
    href: "/library",
    step: "03",
  },
] as const;
