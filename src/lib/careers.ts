import type { Career } from "./careers-types";
import { getCareerField } from "./career-fields";
import { EXTRA_CAREERS } from "./careers-extra";

export type { Career } from "./careers-types";
export {
  CAREER_FIELD_IDS,
  CAREER_FIELD_LABELS,
  getCareerField,
  type CareerFieldId,
} from "./career-fields";

function withField(c: Omit<Career, "field">): Career {
  return { ...c, field: getCareerField(c.id) };
}

const BASE_CAREERS: Omit<Career, "field">[] = [
  {
    id: "se",
    name: "Kỹ sư phần mềm",
    tagline: "Xây sản phẩm số, giải bài toán bằng code",
    highlight: "Triển vọng cao",
    description:
      "Thiết kế và phát triển website, ứng dụng di động, hệ thống phần mềm. Phù hợp học sinh thích logic, kiên nhẫn debug và học công nghệ mới.",
    skills: ["Tư duy logic", "JavaScript/TypeScript", "Làm việc nhóm", "Git"],
    averageSalary: "18–50 triệu/tháng (VN, tuỳ level)",
    relatedSubjects: ["Toán", "Tin học", "Tiếng Anh"],
    opportunities: ["Fullstack", "Mobile", "AI Engineering", "Remote quốc tế"],
    workEnvironment: "Startup, công ty outsource, big tech, freelance",
    studyPath: "CNTT · Khoa học máy tính · Tự học bootcamp + portfolio",
  },
  {
    id: "ux",
    name: "Thiết kế UI/UX",
    tagline: "Thiết kế trải nghiệm người dùng cho sản phẩm số",
    highlight: "Sáng tạo",
    description:
      "Nghiên cứu người dùng, vẽ wireframe, prototype Figma và làm việc với dev/PM để ra sản phẩm dễ dùng, đẹp.",
    skills: ["Figma", "Nghiên cứu UX", "Thẩm mỹ", "Giao tiếp"],
    averageSalary: "12–35 triệu/tháng (VN)",
    relatedSubjects: ["Mỹ thuật", "Tin học", "Ngữ văn"],
    opportunities: ["Product design", "Design system", "Agency", "Freelance"],
    workEnvironment: "Agency, product company, remote",
    studyPath: "Thiết kế đồ hoạ · CNTT · Khóa UX/UI + portfolio",
  },
  {
    id: "da",
    name: "Phân tích dữ liệu",
    tagline: "Biến số liệu thành quyết định",
    highlight: "Hot",
    description:
      "Thu thập, làm sạch và phân tích dữ liệu; báo cáo insight cho kinh doanh, marketing, sản phẩm.",
    skills: ["SQL", "Excel/Sheets", "Trực quan hoá", "Tư duy phân tích"],
    averageSalary: "15–40 triệu/tháng (VN)",
    relatedSubjects: ["Toán", "Tin học", "Kinh tế"],
    opportunities: ["BI Analyst", "Product Analytics", "Data Science"],
    workEnvironment: "Bank, e-commerce, startup, consulting",
    studyPath: "Thống kê · Kinh tế · CNTT + chứng chỉ SQL/BI",
  },
  {
    id: "mk",
    name: "Marketing số",
    tagline: "Kể chuyện thương hiệu trên mạng xã hội",
    description:
      "Lập kế hoạch content, chạy ads, SEO, phân tích hiệu quả chiến dịch digital.",
    skills: ["Content", "Ads", "Phân tích", "Sáng tạo"],
    averageSalary: "10–30 triệu/tháng (VN)",
    relatedSubjects: ["Ngữ văn", "Tiếng Anh", "Kinh tế"],
    opportunities: ["Performance", "Brand", "Growth", "Influencer marketing"],
    workEnvironment: "Agency, brand in-house, startup",
    studyPath: "Marketing · Truyền thông · Chứng chỉ Google/Meta Ads",
  },
  {
    id: "med",
    name: "Bác sĩ / Y khoa",
    tagline: "Chăm sóc sức khoẻ cộng đồng",
    highlight: "Ổn định",
    description:
      "Khám, chẩn đoán, điều trị bệnh; có thể chuyên sâu theo khoa. Lộ trình học dài, đòi hỏi kỷ luật cao.",
    skills: ["Kỷ luật", "Ghi nhớ", "Đồng cảm", "Làm việc áp lực"],
    averageSalary: "12–80+ triệu/tháng (tuỳ chuyên khoa, bệnh viện)",
    relatedSubjects: ["Sinh học", "Hoá", "Toán"],
    opportunities: ["Bệnh viện công/tư", "Nghiên cứu", "Y tế công cộng"],
    workEnvironment: "Bệnh viện, phòng khám, viện nghiên cứu",
    studyPath: "Y khoa · Răng hàm mặt · Dược (tuỳ hướng)",
  },
  {
    id: "teacher",
    name: "Giáo viên",
    tagline: "Truyền cảm hứng và đồng hành học sinh",
    description:
      "Giảng dạy, soạn giáo án, hướng dẫn kỹ năng sống và định hướng cho thế hệ trẻ.",
    skills: ["Giao tiếp", "Kiên nhẫn", "Sư phạm", "Tổ chức"],
    averageSalary: "8–25 triệu/tháng (tuỳ cấp, khu vực)",
    relatedSubjects: ["Ngữ văn", "Toán", "môn chuyên ngành"],
    opportunities: ["Trường công/lập", "Gia sư", "EdTech", "Đào tạo online"],
    workEnvironment: "Trường học, trung tâm, nền tảng EdTech",
    studyPath: "Sư phạm · Chứng chỉ hành nghề giáo dục",
  },
  {
    id: "law",
    name: "Luật sư / Chuyên viên pháp lý",
    tagline: "Bảo vệ quyền lợi và tuân thủ pháp luật",
    description:
      "Tư vấn hợp đồng, tranh tụng, tuân thủ cho doanh nghiệp và cá nhân.",
    skills: ["Lập luận", "Đọc hiểu", "Thuyết trình", "Tỉ mỉ"],
    averageSalary: "15–60 triệu/tháng (tuỳ văn phòng)",
    relatedSubjects: ["Ngữ văn", "Lịch sử", "GDCD"],
    opportunities: ["Văn phòng luật", "In-house counsel", "Tư vấn doanh nghiệp"],
    workEnvironment: "Law firm, doanh nghiệp, nhà nước",
    studyPath: "Luật · Thạc sĩ luật · Thi hành nghề",
  },
  {
    id: "arch",
    name: "Kiến trúc sư",
    tagline: "Thiết kế không gian sống và công trình",
    highlight: "Sáng tạo",
    description:
      "Phác thảo ý tưởng, bản vẽ kỹ thuật, phối hợp kỹ sư xây dựng để hiện thực công trình.",
    skills: ["Vẽ", "3D/CAD", "Tư duy không gian", "Quản lý dự án"],
    averageSalary: "12–40 triệu/tháng (VN)",
    relatedSubjects: ["Mỹ thuật", "Toán", "Vật lý"],
    opportunities: ["Công ty kiến trúc", "Freelance", "Nội thất"],
    workEnvironment: "Studio, công ty xây dựng, tự mở văn phòng",
    studyPath: "Kiến trúc · Xây dựng (thiết kế)",
  },
  {
    id: "nurse",
    name: "Điều dưỡng",
    tagline: "Hỗ trợ điều trị và chăm sóc bệnh nhân",
    description:
      "Theo dõi sức khoẻ, hỗ trợ bác sĩ, tư vấn chăm sóc cho người bệnh và gia đình.",
    skills: ["Đồng cảm", "Kỷ luật", "Làm việc ca", "Giao tiếp"],
    averageSalary: "8–20 triệu/tháng (VN)",
    relatedSubjects: ["Sinh học", "Hoá", "GDCD"],
    opportunities: ["Bệnh viện", "Chăm sóc tại nhà", "Du học nghề"],
    workEnvironment: "Bệnh viện, phòng khám, viện dưỡng lão",
    studyPath: "Điều dưỡng · Trung cấp y · Liên thông đại học",
  },
  {
    id: "mech",
    name: "Kỹ sư cơ khí",
    tagline: "Thiết kế máy móc và hệ thống sản xuất",
    description:
      "Thiết kế, chế tạo, bảo trì máy móc trong sản xuất, ô tô, năng lượng.",
    skills: ["CAD", "Vật lý", "Tư duy hệ thống", "An toàn lao động"],
    averageSalary: "12–35 triệu/tháng (VN)",
    relatedSubjects: ["Toán", "Vật lý", "Tin học"],
    opportunities: ["Ô tô", "Sản xuất", "Năng lượng", "Tự động hoá"],
    workEnvironment: "Nhà máy, tập đoàn sản xuất, R&D",
    studyPath: "Cơ khí · Cơ điện tử · Mechatronics",
  },
  {
    id: "creator",
    name: "Sáng tạo nội dung",
    tagline: "Sáng tạo nội dung video, social",
    highlight: "Linh hoạt",
    description:
      "Sản xuất video, bài viết, livestream; xây dựng thương hiệu cá nhân hoặc cho brand.",
    skills: ["Kể chuyện", "Quay/dựng", "Social", "Tự học nhanh"],
    averageSalary: "Không cố định · 5–50+ triệu/tháng",
    relatedSubjects: ["Ngữ văn", "Mỹ thuật", "Tiếng Anh"],
    opportunities: ["YouTube/TikTok", "Agency", "Brand ambassador"],
    workEnvironment: "Remote, studio nhỏ, agency",
    studyPath: "Truyền thông · Tự học + portfolio + xây kênh",
  },
  {
    id: "account",
    name: "Kế toán / Kiểm toán",
    tagline: "Quản lý tài chính minh bạch",
    description:
      "Ghi chép sổ sách, báo cáo thuế, kiểm toán cho doanh nghiệp.",
    skills: ["Tỉ mỉ", "Excel", "Quy định pháp luật", "Trung thực"],
    averageSalary: "10–30 triệu/tháng (VN)",
    relatedSubjects: ["Toán", "Kinh tế", "Tin học"],
    opportunities: ["Big4", "Doanh nghiệp", "Tư vấn thuế"],
    workEnvironment: "Văn phòng, công ty kiểm toán",
    studyPath: "Kế toán · Kiểm toán · Chứng chỉ ACCA/CPA (tuỳ mục tiêu)",
  },
];

export const CAREERS: Career[] = [
  ...BASE_CAREERS.map(withField),
  ...EXTRA_CAREERS.map(withField),
];

export function getCareerById(id: string): Career | undefined {
  return CAREERS.find((c) => c.id === id);
}
