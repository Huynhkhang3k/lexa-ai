import type { RiasecCode } from "./holland-riasec";

export const HOLLAND_QUESTION_COUNT = 18;

export type HollandOption = {
  id: string;
  label: string;
};

export type HollandQuestion = {
  id: string;
  group: RiasecCode;
  title: string;
  subtitle: string;
  options: HollandOption[];
};

function q(
  id: string,
  group: RiasecCode,
  title: string,
  options: string[],
): HollandQuestion {
  return {
    id,
    group,
    title,
    subtitle: "Chọn tất cả ý bạn cảm thấy đúng với bản thân (có thể chọn nhiều).",
    options: options.map((label, i) => ({ id: `${id}-${i}`, label })),
  };
}

export const HOLLAND_QUESTIONS: HollandQuestion[] = [
  q("r1", "R", "Bạn có hứng thú với nhóm KỸ THUẬT (Realistic)?", [
    "Tôi thích khám phá cấu tạo của máy móc, thiết bị.",
    "Tôi thích sửa chữa đồ vật bị hỏng.",
    "Tôi thích lắp ráp hoặc lắp ghép thiết bị.",
    "Tôi thích làm việc ngoài trời, thực tế.",
    "Tôi thích tự chế tạo một thứ gì đó bằng tay.",
    "Tôi thích làm quen và vận hành công nghệ, máy móc mới.",
  ]),
  q("r2", "R", "Trong học tập và sinh hoạt, điều gì thuộc nhóm KỸ THUẬT hấp dẫn bạn?", [
    "Thích môn có thí nghiệm, thực hành tay.",
    "Thích dự án kỹ thuật, mô hình, robot đơn giản.",
    "Thích sửa đồ dùng, đồ chơi, đồ điện tử nhỏ.",
    "Thích quan sát cách máy móc vận hành.",
    "Thích tham gia hoạt động ngoài trời, thể lực.",
    "Thích học kỹ năng sử dụng dụng cụ, máy móc.",
  ]),
  q("r3", "R", "Bạn muốn thử công việc nào trong nhóm KỸ THUẬT?", [
    "Kỹ sư, thợ máy, kỹ thuật viên.",
    "Công nhân sản xuất, vận hành dây chuyền.",
    "Thợ điện, thợ lắp ráp, bảo trì thiết bị.",
    "Nông nghiệp, chăn nuôi, làm vườn kỹ thuật.",
    "Lái xe, vận hành phương tiện, máy công trình.",
    "An toàn lao động, kiểm tra chất lượng sản phẩm.",
  ]),
  q("i1", "I", "Bạn có hứng thú với nhóm NGHIÊN CỨU (Investigative)?", [
    "Tôi thích đặt câu hỏi và tìm nguyên nhân.",
    "Tôi thích đọc sách, tài liệu chuyên sâu.",
    "Tôi thích làm thí nghiệm khoa học.",
    "Tôi thích giải câu đố logic, toán khó.",
    "Tôi thích phân tích số liệu, biểu đồ.",
    "Tôi thích tìm hiểu công nghệ, AI, lập trình.",
  ]),
  q("i2", "I", "Điều gì trong nhóm NGHIÊN CỨU khiến bạn hứng thú?", [
    "Thích môn Toán, Lý, Hóa, Sinh.",
    "Thích nghiên cứu tài liệu trước khi kết luận.",
    "Thích làm báo cáo có số liệu, bằng chứng.",
    "Thích khám phá điều mới trên internet.",
    "Thích tham gia cuộc thi khoa học, STEM.",
    "Thích học một môn sâu thay vì học nhiều môn nông.",
  ]),
  q("i3", "I", "Bạn muốn thử hướng nào thuộc nhóm NGHIÊN CỨU?", [
    "Bác sĩ, dược sĩ, y tá (khoa học sức khỏe).",
    "Kỹ sư phần mềm, phân tích dữ liệu, AI.",
    "Nhà khoa học, nghiên cứu viên, lab.",
    "Kỹ thuật viên y tế, sinh học.",
    "Luật sư, chuyên viên phân tích chính sách.",
    "Giáo viên bộ môn khoa học, tư vấn học thuật.",
  ]),
  q("a1", "A", "Bạn có hứng thú với nhóm NGHỆ THUẬT (Artistic)?", [
    "Tôi thích vẽ, thiết kế, sáng tạo hình ảnh.",
    "Tôi thích viết lách, kể chuyện, làm nội dung.",
    "Tôi thích âm nhạc, ca hát, nhạc cụ.",
    "Tôi thích chụp ảnh, quay video, dựng phim.",
    "Tôi thích thời trang, trang trí, làm đẹp.",
    "Tôi thích biểu diễn, sân khấu, MC.",
  ]),
  q("a2", "A", "Hoạt động nào thuộc nhóm NGHỆ THUẬT bạn thích?", [
    "Thích môn Mỹ thuật, Âm nhạc, Văn nghệ.",
    "Thích làm poster, banner, thiết kế sản phẩm.",
    "Thích CLB văn nghệ, hội hoạ, nhạc cụ.",
    "Thích sáng tạo video TikTok, YouTube.",
    "Thích thiết kế game, nhân vật, giao diện.",
    "Thích tự do sáng tạo, không thích khuôn mẫu cứng.",
  ]),
  q("a3", "A", "Bạn muốn thử nghề nào trong nhóm NGHỆ THUẬT?", [
    "Thiết kế đồ họa, UI/UX, kiến trúc.",
    "Nhạc sĩ, ca sĩ, sản xuất âm nhạc.",
    "Nhiếp ảnh gia, quay phim, biên tập.",
    "Diễn viên, MC, dẫn chương trình.",
    "Thời trang, nội thất, trang trí.",
    "Nhà sáng tạo nội dung, viết kịch bản.",
  ]),
  q("s1", "S", "Bạn có hứng thú với nhóm XÃ HỘI (Social)?", [
    "Tôi thích giúp đỡ bạn bè, người khác.",
    "Tôi thích lắng nghe và chia sẻ.",
    "Tôi thích dạy hoặc giải thích cho người khác hiểu.",
    "Tôi thích làm việc nhóm, hoạt động cộng đồng.",
    "Tôi thích chăm sóc, an ủi người yếu thế.",
    "Tôi thích giao tiếp, kết nối mọi người.",
  ]),
  q("s2", "S", "Điều gì trong nhóm XÃ HỘI phù hợp với bạn?", [
    "Thích môn có thảo luận, thuyết trình.",
    "Thích làm lớp trưởng, đoàn viên, tổ chức sự kiện.",
    "Thích tình nguyện, hoạt động xã hội.",
    "Thích hòa giải, giải quyết mâu thuẫn nhóm.",
    "Thích làm việc với trẻ em, người già.",
    "Thích môi trường thân thiện, hợp tác.",
  ]),
  q("s3", "S", "Bạn muốn thử hướng nào thuộc nhóm XÃ HỘI?", [
    "Giáo viên, gia sư, đào tạo.",
    "Bác sĩ, y tá, điều dưỡng, tâm lý.",
    "Nhân viên xã hội, tư vấn viên.",
    "Huấn luyện viên, phục vụ cộng đồng.",
    "HR, chăm sóc khách hàng chuyên sâu.",
    "Tiếp viên hàng không, du lịch phục vụ.",
  ]),
  q("e1", "E", "Bạn có hứng thú với nhóm QUẢN LÝ / KINH DOANH (Enterprising)?", [
    "Tôi thích lãnh đạo nhóm, phân công việc.",
    "Tôi thích thuyết trình, thuyết phục người khác.",
    "Tôi thích kinh doanh, bán hàng, kiếm lời.",
    "Tôi thích lập kế hoạch, tổ chức sự kiện.",
    "Tôi thích khởi nghiệp, ý tưởng startup.",
    "Tôi thích cạnh tranh, đạt mục tiêu cao.",
  ]),
  q("e2", "E", "Hoạt động nào thuộc nhóm QUẢN LÝ / KINH DOANH bạn thích?", [
    "Thích môn Kinh tế, GDCD, hoạt động Đoàn.",
    "Thích điều phối dự án nhóm.",
    "Thích tham gia cuộc thi khởi nghiệp.",
    "Thích marketing, quảng bá sản phẩm.",
    "Thích đàm phán, thương lượng.",
    "Thích ra quyết định nhanh trong nhóm.",
  ]),
  q("e3", "E", "Bạn muốn thử nghề nào trong nhóm QUẢN LÝ / KINH DOANH?", [
    "Doanh nhân, startup, quản lý sản phẩm.",
    "Marketing, sales, kinh doanh.",
    "Luật sư, nhà ngoại giao, lãnh đạo.",
    "Quản lý khách sạn, sự kiện.",
    "Môi giới bất động sản, tài chính kinh doanh.",
    "CEO, giám đốc, trưởng nhóm dự án.",
  ]),
  q("c1", "C", "Bạn có hứng thú với nhóm NGHIỆP VỤ / HÀNH CHÍNH (Conventional)?", [
    "Tôi thích làm việc theo quy trình rõ ràng.",
    "Tôi thích sắp xếp hồ sơ, dữ liệu gọn gàng.",
    "Tôi thích làm việc với số, bảng tính.",
    "Tôi thích tuân thủ quy định, checklist.",
    "Tôi thích công việc ổn định, ít rủi ro.",
    "Tôi thích kiểm tra chi tiết, không sai sót.",
  ]),
  q("c2", "C", "Điều gì trong nhóm NGHIỆP VỤ / HÀNH CHÍNH phù hợp bạn?", [
    "Thích môn có quy tắc, đáp án rõ.",
    "Thích ghi chép, lập bảng, thống kê.",
    "Thích làm thủ kho, thủ quỹ lớp.",
    "Thích làm việc một mình, tập trung.",
    "Thích môi trường văn phòng ngăn nắp.",
    "Thích Excel, phần mềm quản lý.",
  ]),
  q("c3", "C", "Bạn muốn thử hướng nào thuộc nhóm NGHIỆP VỤ / HÀNH CHÍNH?", [
    "Kế toán, kiểm toán, thuế.",
    "Nhân viên ngân hàng, tài chính.",
    "Hành chính, văn thư, công chức.",
    "Thư ký, trợ lý, quản lý văn phòng.",
    "Kiểm soát chất lượng, logistics.",
    "Nhập liệu, quản lý cơ sở dữ liệu.",
  ]),
];

export function getHollandQuestion(index: number): HollandQuestion | undefined {
  return HOLLAND_QUESTIONS[index];
}
