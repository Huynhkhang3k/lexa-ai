/** Mật mã Holland (RIASEC) — nền tảng hướng nghiệp LEXA AI */

export const HOLLAND_RIASEC_DIAGRAM_URL =
  "https://i.postimg.cc/Ssw-Tykkt/Gemini-Generated-Image-c7t1g8c7t1g8c7t1-removebg-preview.png";

export type RiasecCode = "R" | "I" | "A" | "S" | "E" | "C";

export const RIASEC_ORDER: RiasecCode[] = ["R", "I", "A", "S", "E", "C"];

export type RiasecType = {
  code: RiasecCode;
  labelVi: string;
  labelEn: string;
  shortDesc: string;
  color: string;
  ring: string;
  bg: string;
  imageUrl: string;
  fields: string[];
  majors: string[];
  learningEnv: string;
  workEnv: string;
  skills: string[];
  personality: string;
};

export const RIASEC_GROUP_IMAGES: Record<RiasecCode, string> = {
  R: "https://i.postimg.cc/zvcnJBJN/Gemini-Generated-Image-fq078qfq078qfq07-removebg-preview.png",
  I: "https://i.postimg.cc/xTBKhcxN/Gemini-Generated-Image-kwsslckwsslckwss-removebg-preview.png",
  A: "https://i.postimg.cc/s247MKVW/Gemini-Generated-Image-hhbsvehhbsvehhbs-removebg-preview.png",
  S: "https://i.postimg.cc/mrzKRzBx/Gemini-Generated-Image-u92dfju92dfju92d-removebg-preview.png",
  E: "https://i.postimg.cc/76N9ywCj/Gemini-Generated-Image-k3b909k3b909k3b9-removebg-preview.png",
  C: "https://i.postimg.cc/xj4pRGmg/d8799b64-7892-4a6f-a66a-9011381ee50f-removebg-preview.png",
};

export const RIASEC_TYPES: RiasecType[] = [
  {
    code: "R",
    labelVi: "Kỹ thuật",
    labelEn: "Realistic",
    shortDesc: "Thích làm việc tay chân, máy móc, công cụ và thực hành cụ thể.",
    color: "text-red-600 dark:text-red-400",
    ring: "ring-red-500/40",
    bg: "bg-red-500/10 dark:bg-red-500/15",
    imageUrl: RIASEC_GROUP_IMAGES.R,
    fields: ["Kỹ thuật", "Cơ khí", "Xây dựng", "Nông nghiệp", "An toàn lao động"],
    majors: ["Cơ khí", "Điện – Điện tử", "Xây dựng", "Công nghệ ô tô", "Nông nghiệp"],
    learningEnv: "Thí nghiệm thực hành, xưởng, dự án kỹ thuật, học qua làm.",
    workEnv: "Nhà máy, công trường, xưởng sửa chữa, phòng lab kỹ thuật.",
    skills: ["Thực hành", "An toàn", "Sử dụng công cụ", "Tỉ mỉ", "Giải quyết sự cố"],
    personality:
      "Bạn thiên về hành động cụ thể, thích nhìn thấy kết quả trực tiếp từ công việc tay nghề hoặc kỹ thuật.",
  },
  {
    code: "I",
    labelVi: "Nghiên cứu",
    labelEn: "Investigative",
    shortDesc: "Thích tư duy, phân tích, khoa học và khám phá nguyên nhân.",
    color: "text-orange-600 dark:text-orange-400",
    ring: "ring-orange-500/40",
    bg: "bg-orange-500/10 dark:bg-orange-500/15",
    imageUrl: RIASEC_GROUP_IMAGES.I,
    fields: ["Khoa học", "Công nghệ", "Y học", "Phân tích dữ liệu", "Nghiên cứu"],
    majors: ["CNTT", "Y khoa", "Dược", "Toán – Tin", "Sinh học", "Vật lý"],
    learningEnv: "Đọc sâu, làm bài tập logic, thí nghiệm, nghiên cứu tài liệu.",
    workEnv: "Phòng lab, viện nghiên cứu, công ty công nghệ, bệnh viện.",
    skills: ["Tư duy logic", "Phân tích", "Tò mò", "Kiên nhẫn", "Toán – Khoa học"],
    personality:
      "Bạn thích đặt câu hỏi “tại sao”, tìm hiểu sâu và giải quyết vấn đề bằng dữ kiện.",
  },
  {
    code: "A",
    labelVi: "Nghệ thuật",
    labelEn: "Artistic",
    shortDesc: "Thích sáng tạo, biểu đạt ý tưởng và làm việc tự do.",
    color: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/40",
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    imageUrl: RIASEC_GROUP_IMAGES.A,
    fields: ["Thiết kế", "Âm nhạc", "Truyền thông sáng tạo", "Thời trang", "Nội dung số"],
    majors: ["Mỹ thuật", "Thiết kế đồ họa", "Kiến trúc", "Âm nhạc", "Truyền thông"],
    learningEnv: "Studio, workshop sáng tạo, dự án cá nhân, portfolio.",
    workEnv: "Studio, agency sáng tạo, freelance, môi trường linh hoạt.",
    skills: ["Sáng tạo", "Thẩm mỹ", "Storytelling", "Công cụ thiết kế", "Tư duy hình ảnh"],
    personality:
      "Bạn có xu hướng thể hiện cá tính qua sản phẩm, ý tưởng hoặc nghệ thuật.",
  },
  {
    code: "S",
    labelVi: "Xã hội",
    labelEn: "Social",
    shortDesc: "Thích giúp đỡ, dạy học, chăm sóc và làm việc với con người.",
    color: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/40",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    imageUrl: RIASEC_GROUP_IMAGES.S,
    fields: ["Giáo dục", "Y tế", "Tư vấn", "Công tác xã hội", "Dịch vụ cộng đồng"],
    majors: ["Sư phạm", "Y khoa", "Điều dưỡng", "Tâm lý", "Công tác xã hội"],
    learningEnv: "Thảo luận nhóm, thuyết trình, hoạt động cộng đồng, thực tập.",
    workEnv: "Trường học, bệnh viện, trung tâm tư vấn, tổ chức xã hội.",
    skills: ["Giao tiếp", "Đồng cảm", "Lắng nghe", "Hợp tác", "Kiên nhẫn"],
    personality:
      "Bạn năng lượng khi được kết nối, hỗ trợ và đồng hành cùng người khác.",
  },
  {
    code: "E",
    labelVi: "Quản lý",
    labelEn: "Enterprising",
    shortDesc: "Thích lãnh đạo, thuyết phục, kinh doanh và ra quyết định.",
    color: "text-sky-600 dark:text-sky-400",
    ring: "ring-sky-500/40",
    bg: "bg-sky-500/10 dark:bg-sky-500/15",
    imageUrl: RIASEC_GROUP_IMAGES.E,
    fields: ["Kinh doanh", "Marketing", "Khởi nghiệp", "Bán hàng", "Quản lý"],
    majors: ["Quản trị kinh doanh", "Marketing", "Tài chính", "Luật kinh tế"],
    learningEnv: "Dự án nhóm, thuyết trình, case study, CLB kinh doanh.",
    workEnv: "Doanh nghiệp, startup, sàn thương mại, văn phòng sales.",
    skills: ["Thuyết phục", "Lãnh đạo", "Đàm phán", "Tư duy kinh doanh", "Tự tin"],
    personality:
      "Bạn thích định hướng, thúc đẩy nhóm và biến ý tưởng thành kết quả thực tế.",
  },
  {
    code: "C",
    labelVi: "Nghiệp vụ",
    labelEn: "Conventional",
    shortDesc: "Thích quy trình rõ, số liệu chính xác và công việc có tổ chức.",
    color: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/40",
    bg: "bg-violet-500/10 dark:bg-violet-500/15",
    imageUrl: RIASEC_GROUP_IMAGES.C,
    fields: ["Kế toán", "Hành chính", "Ngân hàng", "Kiểm toán", "Văn phòng"],
    majors: ["Kế toán", "Kiểm toán", "Tài chính – Ngân hàng", "Quản trị văn phòng"],
    learningEnv: "Bài tập có quy trình, bảng tính, checklist, ôn theo chuẩn.",
    workEnv: "Văn phòng, ngân hàng, công ty kiểm toán, cơ quan hành chính.",
    skills: ["Tỉ mỉ", "Tổ chức", "Excel", "Tuân thủ quy định", "Quản lý thời gian"],
    personality:
      "Bạn yên tâm khi mọi thứ có trật tự, dữ liệu rõ ràng và quy trình ổn định.",
  },
];

export function getRiasecType(code: RiasecCode): RiasecType {
  return RIASEC_TYPES.find((t) => t.code === code)!;
}

export function riasecLabel(code: RiasecCode): string {
  return getRiasecType(code).labelVi;
}
