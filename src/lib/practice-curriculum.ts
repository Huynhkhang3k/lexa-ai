import type { QuestionCategory, QuestionType } from "./practice-types";

/** Chương trình Toán 6–12 — bám Bách khoa toàn thư (Kết nối tri thức) */
export type CurriculumSkill = { id: string; name: string };
export type CurriculumTopic = {
  id: string;
  name: string;
  skills: CurriculumSkill[];
};
export type CurriculumChapter = {
  id: string;
  name: string;
  category: QuestionCategory;
  topics: CurriculumTopic[];
};
export type GradeCurriculum = { grade: number; chapters: CurriculumChapter[] };

export const CATEGORY_WEIGHTS: Record<QuestionCategory, number> = {
  theory: 0.35,
  calculation: 0.35,
  geometry: 0.2,
  real_world: 0.1,
};

function skills(...names: string[]): CurriculumSkill[] {
  return names.map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, ""),
    name,
  }));
}

function topic(id: string, name: string, skillNames: string[]): CurriculumTopic {
  return { id, name, skills: skills(...skillNames) };
}

function chapter(
  id: string,
  name: string,
  category: QuestionCategory,
  topics: CurriculumTopic[],
): CurriculumChapter {
  return { id, name, category, topics };
}

// ─── LỚP 6 (9 chương) ───────────────────────────────────────────────────────
const GRADE_6: GradeCurriculum = {
  grade: 6,
  chapters: [
    chapter("ch1_tap_hop_tn", "Chương I: Tập hợp các số tự nhiên", "theory", [
      topic("tap_hop_n", "Tập hợp N và N*", ["Liệt kê phần tử", "Ký hiệu tập hợp"]),
      topic("phep_tinh_tn", "Phép tính số tự nhiên", ["Thứ tự phép tính", "Ngoặc trước"]),
      topic("luy_thua", "Lũy thừa", ["a^m · a^n = a^(m+n)", "a^m : a^n = a^(m-n)"]),
    ]),
    chapter("ch2_chia_het", "Chương II: Tính chia hết", "theory", [
      topic("dau_hieu_ch", "Dấu hiệu chia hết", ["Chia hết cho 2, 3, 5, 9", "Nhận biết chia hết"]),
      topic("nguyen_to", "Số nguyên tố", ["Phân tích thừa số", "ƯCLN", "BCNN"]),
    ]),
    chapter("ch3_so_nguyen", "Chương III: Số nguyên", "theory", [
      topic("so_nguyen_z", "Tập số nguyên Z", ["So sánh số nguyên", "Giá trị tuyệt đối"]),
      topic("dau_ngoac", "Quy tắc dấu ngoặc", ["Đổi dấu trong ngoặc", "Chuyển vế"]),
    ]),
    chapter("ch4_hh_truc_quan", "Chương IV–V: Hình học trực quan", "geometry", [
      topic("tam_giac_deu", "Tam giác đều", ["Nhận dạng", "Tính chu vi"]),
      topic("hinh_vuong", "Hình vuông", ["4 cạnh bằng nhau", "4 góc vuông"]),
      topic("luc_giac", "Lục giác đều", ["Ghép tam giác đều", "Đối xứng"]),
    ]),
    chapter("ch6_phan_so", "Chương VI: Phân số", "calculation", [
      topic("ps_bang_nhau", "Phân số bằng nhau", ["Rút gọn", "Quy đồng"]),
      topic("ps_tinh", "Phép tính phân số", ["Cộng trừ cùng mẫu", "Nhân chia phân số"]),
    ]),
    chapter("ch7_so_tp", "Chương VII: Số thập phân", "calculation", [
      topic("stp_tinh", "Phép tính số thập phân", ["Cộng trừ nhân chia"]),
      topic("lam_tron", "Làm tròn và phần trăm", ["Quy tắc làm tròn", "Tỉ số phần trăm"]),
    ]),
    chapter("ch8_hh_co_ban", "Chương VIII: Hình học cơ bản", "geometry", [
      topic("diem_duong", "Điểm, đường thẳng, đoạn thẳng", ["Trung điểm", "Đo độ dài"]),
      topic("goc", "Góc", ["Góc bẹt 180°", "Đo góc"]),
    ]),
    chapter("ch9_du_lieu_xs", "Chương IX: Dữ liệu và xác suất", "real_world", [
      topic("bieu_do", "Biểu đồ", ["Đọc biểu đồ", "Tần số"]),
      topic("xs_thuc_nghiem", "Xác suất thực nghiệm", ["Tính xác suất thực nghiệm"]),
    ]),
  ],
};

// ─── LỚP 7 (10 chương) ──────────────────────────────────────────────────────
const GRADE_7: GradeCurriculum = {
  grade: 7,
  chapters: [
    chapter("ch1_2_so_huu_ti", "Chương I–II: Số hữu tỉ và Số thực", "theory", [
      topic("so_huu_ti", "Số hữu tỉ Q", ["Viết dạng a/b", "So sánh trên trục số"]),
      topic("so_vo_ti", "Số vô tỉ và số thực R", ["Căn bậc hai", "Giá trị tuyệt đối |x|"]),
    ]),
    chapter("ch3_goc_song_song", "Chương III: Góc và đường thẳng song song", "geometry", [
      topic("goc_doi_dinh", "Góc đối đỉnh", ["Tính góc", "Góc bằng nhau"]),
      topic("euclid", "Tiên đề Euclid", ["Đường song song", "Góc so le trong"]),
    ]),
    chapter("ch4_tg_bang", "Chương IV: Tam giác bằng nhau", "geometry", [
      topic("tg_bang", "Các trường hợp bằng nhau", ["c.c.c", "c.g.c", "g.c.g"]),
      topic("tong_goc_tg", "Tổng góc tam giác", ["Tổng bằng 180°", "Tam giác vuông"]),
    ]),
    chapter("ch5_du_lieu", "Chương V: Thu thập và biểu diễn dữ liệu", "real_world", [
      topic("quat_tron", "Biểu đồ quạt tròn", ["Đọc %", "So sánh phần"]),
      topic("doan_thang", "Biểu đồ đoạn thẳng", ["Xu hướng dữ liệu"]),
    ]),
    chapter("ch6_ti_le", "Chương VI: Tỉ lệ thức và Đại lượng tỉ lệ", "calculation", [
      topic("ti_le_thuc", "Tỉ lệ thức", ["a/b = c/d", "Dãy tỉ số bằng nhau"]),
      topic("ti_le_thuan_nghich", "Tỉ lệ thuận nghịch", ["Bài toán thực tế"]),
    ]),
    chapter("ch7_da_thuc", "Chương VII: Biểu thức đại số và Đa thức", "theory", [
      topic("da_thuc", "Đa thức một biến", ["Thu gọn", "Tính giá trị"]),
      topic("nghiem", "Nghiệm đa thức", ["P(a) = 0", "Kiểm tra nghiệm"]),
    ]),
    chapter("ch9_yeu_to_tg", "Chương IX: Quan hệ yếu tố trong tam giác", "geometry", [
      topic("bat_dang_tg", "Bất đẳng thức tam giác", ["|b-c| < a < b+c"]),
      topic("duong_dong_quy", "Các đường đồng quy", ["Trung tuyến", "Đường cao", "Phân giác"]),
    ]),
    chapter("ch10_hinh_khoi", "Chương X: Hình khối trực quan", "geometry", [
      topic("hhcn", "Hình hộp chữ nhật", ["V = a·b·h", "Diện tích"]),
      topic("hlp", "Hình lập phương", ["Thể tích", "Diện tích toàn phần"]),
      topic("lang_tru", "Lăng trụ đứng", ["V = S_đáy · h"]),
    ]),
  ],
};

// ─── LỚP 8 (10 chương) ──────────────────────────────────────────────────────
const GRADE_8: GradeCurriculum = {
  grade: 8,
  chapters: [
    chapter("ch1_2_da_thuc_hdt", "Chương I–II: Đa thức và Hằng đẳng thức", "calculation", [
      topic("da_thuc_8", "Phép tính đa thức", ["Cộng trừ nhân", "Chia đa thức"]),
      topic("hdt_7", "7 hằng đẳng thức", ["(A±B)²", "A²−B²", "(A±B)³", "A³±B³"]),
    ]),
    chapter("ch3_tu_giac", "Chương III: Tứ giác", "geometry", [
      topic("hinh_thang", "Hình thang", ["Tính góc", "Tính cạnh"]),
      topic("hbh_hcn_thoi", "Bình hành, chữ nhật, thoi", ["Tính chất", "Đường chéo"]),
    ]),
    chapter("ch4_thales", "Chương IV: Định lí Thalès", "geometry", [
      topic("thales", "Định lí Thalès", ["Tỉ lệ cạnh", "Chứng minh"]),
      topic("trung_binh", "Đường trung bình", ["Song song cạnh thứ 3", "Bằng nửa cạnh"]),
    ]),
    chapter("ch6_phan_thuc", "Chương VI: Phân thức đại số", "calculation", [
      topic("phan_thuc", "Phân thức đại số", ["Rút gọn", "Cộng trừ nhân chia"]),
    ]),
    chapter("ch7_pt_ham", "Chương VII: Phương trình và Hàm số bậc nhất", "theory", [
      topic("pt_bac_nhat", "PT bậc nhất một ẩn", ["Giải ax+b=0", "Bài toán lập PT"]),
      topic("ham_y_ax_b", "Hàm số y = ax + b", ["Vẽ đồ thị", "Đọc đồ thị"]),
    ]),
    chapter("ch8_9_dong_dang", "Chương VIII–IX: Hình đồng dạng", "geometry", [
      topic("tg_dong_dang", "Tam giác đồng dạng", ["c.c.c", "c.g.c", "g.g"]),
      topic("pythagore", "Định lí Pythagore", ["a² = b² + c²", "Tam giác vuông"]),
      topic("ti_so_dt", "Tỉ số diện tích", ["Tỉ số đồng dạng bình phương"]),
    ]),
  ],
};

// ─── LỚP 9 (10 chương) ──────────────────────────────────────────────────────
const GRADE_9: GradeCurriculum = {
  grade: 9,
  chapters: [
    chapter("ch1_2_pt_bpt", "Chương I–II: Phương trình và Bất phương trình", "theory", [
      topic("he_pt", "Hệ phương trình", ["Phương pháp thế", "Cộng đại số"]),
      topic("bpt_bac_nhat", "BPT bậc nhất", ["Đổi chiều khi nhân số âm"]),
    ]),
    chapter("ch3_can_thuc", "Chương III: Căn thức", "calculation", [
      topic("can_hai", "Căn bậc hai", ["√A² = |A|", "√(A·B) = √A·√B"]),
      topic("can_ba", "Căn bậc ba", ["Rút gọn", "Phép tính"]),
    ]),
    chapter("ch4_htl_tg_vuong", "Chương IV: Hệ thức lượng tam giác vuông", "geometry", [
      topic("tslg", "Tỉ số lượng giác", ["sin cos tan cot", "Tính cạnh góc"]),
      topic("htl_duong_cao", "Hệ thức đường cao", ["h² = b'·c'", "1/h² = 1/b² + 1/c²"]),
    ]),
    chapter("ch5_9_duong_tron", "Chương V–IX: Đường tròn", "geometry", [
      topic("tiet_tuyen", "Tiếp tuyến", ["Góc tiếp tuyến", "Tính độ dài"]),
      topic("goc_noi_tiep", "Góc nội tiếp", ["Bằng nửa cung", "Tứ giác nội tiếp"]),
    ]),
    chapter("ch6_parabol_pt2", "Chương VI: Hàm số y = ax² và PT bậc hai", "theory", [
      topic("parabol", "Parabol y = ax²", ["Vẽ đồ thị", "Tính chất"]),
      topic("pt_bac_hai", "PT bậc hai", ["Delta", "Công thức nghiệm", "Viète"]),
    ]),
    chapter("ch10_hinh_khoi", "Chương X: Hình khối trực quan", "geometry", [
      topic("hinh_tru", "Hình trụ", ["Thể tích", "Diện tích xung quanh"]),
      topic("hinh_non", "Hình nón", ["V = ⅓πR²h"]),
      topic("hinh_cau", "Hình cầu", ["V = 4/3 πR³", "S = 4πR²"]),
    ]),
    chapter("ch_xs_tk", "Thống kê và xác suất", "real_world", [
      topic("thong_ke", "Thống kê mô tả", ["Trung bình", "Trung vị", "Mốt"]),
      topic("xac_suat", "Xác suất", ["Tính xác suất", "Bài toán thực tế"]),
    ]),
  ],
};

// ─── LỚP 10 (9 chương) ──────────────────────────────────────────────────────
const GRADE_10: GradeCurriculum = {
  grade: 10,
  chapters: [
    chapter("ch1_2_menh_de_tap_hop", "Chương I–II: Mệnh đề, Tập hợp, BPT hai ẩn", "theory", [
      topic("tap_hop_logic", "Tập hợp và logic", ["Giao hợp", "Hiệu", "Mệnh đề"]),
      topic("bpt_hai_an", "BPT bậc nhất hai ẩn", ["Miền nghiệm", "Vẽ miền"]),
    ]),
    chapter("ch3_htl_tg", "Chương III: Hệ thức lượng trong tam giác", "geometry", [
      topic("cosin", "Định lí Côsin", ["a² = b² + c² − 2bc cos A"]),
      topic("sin", "Định lí Sin", ["a/sin A = 2R", "Diện tích tam giác"]),
    ]),
    chapter("ch4_vecto", "Chương IV: Vectơ", "geometry", [
      topic("vecto_toan", "Phép toán vectơ", ["Quy tắc 3 điểm", "Hình bình hành"]),
      topic("tich_vo_huong", "Tích vô hướng", ["a·b = |a||b|cos"]),
    ]),
    chapter("ch6_ham_bac_hai", "Chương VI: Hàm số bậc hai", "calculation", [
      topic("parabol_10", "Parabol y = ax² + bx + c", ["Tọa độ đỉnh", "Trục đối xứng"]),
    ]),
    chapter("ch7_oxy", "Chương VII: Tọa độ Oxy", "geometry", [
      topic("duong_thang", "Phương trình đường thẳng", ["Vectơ pháp tuyến"]),
      topic("duong_tron", "Phương trình đường tròn", ["(x−a)² + (y−b)² = R²"]),
      topic("conic", "Elip, Hyperbol, Parabol", ["PT chính tắc"]),
    ]),
    chapter("ch8_to_hop", "Chương VIII: Đại số tổ hợp", "theory", [
      topic("hoan_chinh", "Hoán vị, chỉnh hợp, tổ hợp", ["P_n", "A_n^k", "C_n^k"]),
      topic("newton", "Nhị thức Newton", ["Khai triển (a+b)^n"]),
    ]),
  ],
};

// ─── LỚP 11 (9 chương) ──────────────────────────────────────────────────────
const GRADE_11: GradeCurriculum = {
  grade: 11,
  chapters: [
    chapter("ch1_ham_lg", "Chương I: Hàm số và PT lượng giác", "theory", [
      topic("cong_thuc_lg", "Công thức lượng giác", ["sin²+cos²=1", "sin2x", "cos2x"]),
      topic("pt_lg", "Phương trình lượng giác", ["sin x = sin α", "cos x = cos α"]),
    ]),
    chapter("ch2_day_so", "Chương II: Dãy số, CSP, CSN", "calculation", [
      topic("csp", "Cấp số cộng", ["u_n = u_1 + (n−1)d", "S_n"]),
      topic("csn", "Cấp số nhân", ["u_n = u_1·q^(n−1)", "S_n"]),
    ]),
    chapter("ch4_7_hh_kg", "Chương IV–VII: Hình học không gian", "geometry", [
      topic("song_song", "Quan hệ song song", ["Đường thẳng // mặt phẳng"]),
      topic("vuong_goc", "Vuông góc", ["d ⊥ (P)", "Ba đường vuông góc"]),
      topic("the_tich_kg", "Thể tích khối", ["Khoảng cách", "Góc"]),
    ]),
    chapter("ch5_gioi_han", "Chương V: Giới hạn và liên tục", "theory", [
      topic("gioi_han", "Giới hạn", ["lim 1/n = 0", "Liên tục tại điểm"]),
      topic("csn_vo_han", "Tổng CSN vô hạn", ["S = u_1/(1−q)"]),
    ]),
    chapter("ch6_mu_log", "Chương VI: Hàm mũ và Lôgarit", "calculation", [
      topic("ham_mu", "Hàm số mũ", ["Tính chất", "Đồ thị"]),
      topic("logarit", "Lôgarit", ["log(ab) = log a + log b", "PT log"]),
    ]),
    chapter("ch9_dao_ham", "Chương IX: Đạo hàm", "calculation", [
      topic("dao_ham", "Quy tắc đạo hàm", ["(x^n)'", "(sin x)'", "(e^x)'"]),
      topic("tiep_tuyen", "Ý nghĩa hình học", ["Hệ số góc tiếp tuyến"]),
    ]),
  ],
};

// ─── LỚP 12 (6 chương cốt lõi) ──────────────────────────────────────────────
const GRADE_12: GradeCurriculum = {
  grade: 12,
  chapters: [
    chapter("ch1_ung_dung_dh", "Chương I: Ứng dụng đạo hàm", "calculation", [
      topic("don_dieu", "Tính đơn điệu", ["y' ≥ 0 đồng biến"]),
      topic("cuc_tri", "Cực trị", ["Cực đại", "Cực tiểu"]),
      topic("khao_sat", "Khảo sát hàm số", ["Tiệm cận", "Vẽ đồ thị"]),
    ]),
    chapter("ch2_5_oxyz", "Chương II–V: Tọa độ Oxyz", "geometry", [
      topic("vecto_oxyz", "Vectơ Oxyz", ["Tích vô hướng", "Tích có hướng"]),
      topic("mat_phang", "Phương trình mặt phẳng", ["VTPT n = (A,B,C)"]),
      topic("mat_cau", "Phương trình mặt cầu", ["Tâm I(a,b,c)", "Bán kính R"]),
    ]),
    chapter("ch4_tich_phan", "Chương IV: Nguyên hàm và Tích phân", "calculation", [
      topic("nguyen_ham", "Nguyên hàm", ["∫f(x)dx = F(x) + C"]),
      topic("tich_phan", "Tích phân xác định", ["Newton-Leibniz", "Diện tích"]),
      topic("the_tich_quay", "Thể tích tròn xoay", ["V = π∫f²(x)dx"]),
    ]),
    chapter("ch_xs_to_hop", "Xác suất và tổ hợp nâng cao", "real_world", [
      topic("to_hop", "Tổ hợp", ["Chỉnh hợp", "Hoán vị"]),
      topic("xs_co_dk", "Xác suất có điều kiện", ["Bài toán thực tế"]),
    ]),
  ],
};

const CURRICULA: GradeCurriculum[] = [
  GRADE_6,
  GRADE_7,
  GRADE_8,
  GRADE_9,
  GRADE_10,
  GRADE_11,
  GRADE_12,
];

/** Tóm tắt độ phủ theo Bách khoa toàn thư */
export const CURRICULUM_COVERAGE: Record<number, { chapters: number; status: string }> = {
  6: { chapters: 9, status: "Kết nối tri thức — 100%" },
  7: { chapters: 10, status: "Kết nối tri thức — 100%" },
  8: { chapters: 10, status: "Kết nối tri thức — 100%" },
  9: { chapters: 10, status: "Kết nối tri thức — 100%" },
  10: { chapters: 9, status: "Kết nối tri thức — 100%" },
  11: { chapters: 9, status: "Kết nối tri thức — 100%" },
  12: { chapters: 6, status: "Kết nối tri thức — 100%" },
};

export function getCurriculumForGrade(gradeNum: number): GradeCurriculum {
  const found = CURRICULA.find((c) => c.grade === gradeNum);
  if (found) return found;
  if (gradeNum < 6) return GRADE_6;
  if (gradeNum >= 12) return GRADE_12;
  if (gradeNum >= 11) return GRADE_11;
  return GRADE_10;
}

export function flattenCurriculumSlots(curriculum: GradeCurriculum) {
  const slots: {
    chapterId: string;
    chapter: string;
    topicId: string;
    topic: string;
    skillId: string;
    skill: string;
    category: QuestionCategory;
  }[] = [];
  for (const ch of curriculum.chapters) {
    for (const tp of ch.topics) {
      for (const sk of tp.skills) {
        slots.push({
          chapterId: ch.id,
          chapter: ch.name,
          topicId: tp.id,
          topic: tp.name,
          skillId: sk.id,
          skill: sk.name,
          category: ch.category,
        });
      }
    }
  }
  return slots;
}

export const THEORY_TYPES: QuestionType[] = [
  "mcq",
  "fill_number",
  "true_false",
  "multi_select",
  "fill_sign",
  "match",
  "order",
];
export const GEOMETRY_TYPES: QuestionType[] = ["mcq", "fill_number", "true_false", "geo_pick"];
export const REAL_WORLD_TYPES: QuestionType[] = ["mcq", "fill_number", "match", "drag_drop"];
export const THINKING_TYPES: QuestionType[] = ["multi_select", "order", "mcq", "match"];

export function questionTypesForCategory(cat: QuestionCategory): QuestionType[] {
  switch (cat) {
    case "geometry":
      return GEOMETRY_TYPES;
    case "real_world":
      return REAL_WORLD_TYPES;
    case "calculation":
      return ["mcq", "fill_number", "fill_sign", "true_false", "multi_select"];
    default:
      return THEORY_TYPES;
  }
}
