import type { RiasecCode } from "./holland-riasec";

export const HOLLAND_QUESTION_COUNT = 18;

export const HOLLAND_UNDETERMINED_LABEL =
  "Tôi chưa xác định được sở thích của mình ở nhóm này";

export const HOLLAND_QUESTION_SUBTITLE =
  "Chọn tất cả ý phù hợp (có thể chọn nhiều). Nếu chưa chắc, dùng lựa chọn riêng bên dưới.";

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
    subtitle: HOLLAND_QUESTION_SUBTITLE,
    options: options.map((label, i) => ({ id: `${id}-${i}`, label })),
  };
}

export const HOLLAND_QUESTIONS: HollandQuestion[] = [
  q("r1", "R", "Bạn cảm thấy điều nào gần với bản thân?", [
    "Tôi thích tìm hiểu cách mọi thứ hoạt động.",
    "Tôi thích làm việc với những thứ có tính thực tế.",
    "Tôi thích giải quyết vấn đề bằng hành động.",
    "Tôi thích tạo ra hoặc cải thiện một thứ gì đó.",
    "Tôi thích học cách sử dụng những thứ mới.",
    "Tôi thích trải nghiệm và học thông qua thực tế.",
  ]),
  q("r2", "R", "Trong học tập và cuộc sống, điều gì khiến bạn hứng thú?", [
    "Tìm hiểu nguyên nhân khiến một việc xảy ra.",
    "Làm thử để xem kết quả.",
    "Quan sát cách mọi thứ vận hành.",
    "Tìm cách cải thiện một vấn đề.",
    "Học bằng trải nghiệm thực tế.",
    "Giải quyết vấn đề có kết quả rõ ràng.",
  ]),
  q("r3", "R", "Bạn muốn thử kiểu công việc nào?", [
    "Công việc tạo ra kết quả cụ thể.",
    "Công việc xử lý vấn đề thực tế.",
    "Công việc liên quan đến hệ thống hoặc công nghệ.",
    "Công việc cần sự thực hành.",
    "Công việc kết hợp suy nghĩ và hành động.",
  ]),
  q("i1", "I", "Bạn cảm thấy điều nào gần với bản thân?", [
    "Tôi thích đặt câu hỏi về mọi thứ.",
    "Tôi thích tìm hiểu sâu về một chủ đề.",
    "Tôi thích phân tích trước khi quyết định.",
    "Tôi thích tìm nguyên nhân.",
    "Tôi thích khám phá kiến thức mới.",
    "Tôi thích giải quyết vấn đề bằng suy nghĩ.",
  ]),
  q("i2", "I", "Trong học tập và cuộc sống, điều gì khiến bạn hứng thú?", [
    "Tôi thích hiểu bản chất vấn đề.",
    "Tôi thích tìm thêm thông tin.",
    "Tôi thích so sánh nhiều khả năng.",
    "Tôi thích dựa vào bằng chứng.",
    "Tôi thích học sâu một lĩnh vực.",
    "Tôi thích câu hỏi khó.",
  ]),
  q("i3", "I", "Bạn muốn thử môi trường làm việc nào?", [
    "Môi trường cần tư duy phân tích.",
    "Môi trường có nhiều điều mới để khám phá.",
    "Môi trường giải quyết vấn đề phức tạp.",
    "Môi trường tạo ra kiến thức mới.",
    "Môi trường cần logic.",
  ]),
  q("a1", "A", "Bạn cảm thấy điều nào gần với bản thân?", [
    "Tôi thích thể hiện ý tưởng theo cách riêng.",
    "Tôi thích sự sáng tạo.",
    "Tôi thích tưởng tượng điều mới.",
    "Tôi quan tâm đến cái đẹp.",
    "Tôi thích tạo dấu ấn cá nhân.",
    "Tôi thích sự khác biệt.",
  ]),
  q("a2", "A", "Trong học tập và cuộc sống, điều gì khiến bạn hứng thú?", [
    "Tôi thích tự do sáng tạo.",
    "Tôi thích thử ý tưởng mới.",
    "Tôi thích thể hiện suy nghĩ.",
    "Tôi thích tạo ra thứ độc đáo.",
    "Tôi thích nhiều cách làm khác nhau.",
  ]),
  q("a3", "A", "Bạn muốn thử kiểu công việc nào?", [
    "Công việc cần sáng tạo.",
    "Công việc thể hiện cá tính.",
    "Công việc tạo ra sản phẩm có cảm xúc.",
    "Công việc cần tưởng tượng.",
    "Công việc đổi mới thường xuyên.",
  ]),
  q("s1", "S", "Bạn cảm thấy điều nào gần với bản thân?", [
    "Tôi thích giúp đỡ người khác.",
    "Tôi thích giao tiếp.",
    "Tôi thích chia sẻ kiến thức.",
    "Tôi quan tâm cảm xúc người khác.",
    "Tôi thích làm việc cùng mọi người.",
  ]),
  q("s2", "S", "Trong học tập và cuộc sống, điều gì khiến bạn hứng thú?", [
    "Tôi thích hợp tác.",
    "Tôi thích trao đổi ý kiến.",
    "Tôi thích hỗ trợ người khác.",
    "Tôi thích tạo sự kết nối.",
    "Tôi thích môi trường thân thiện.",
  ]),
  q("s3", "S", "Bạn muốn thử kiểu công việc nào?", [
    "Công việc liên quan đến con người.",
    "Công việc cần giao tiếp.",
    "Công việc hỗ trợ người khác.",
    "Công việc cần lắng nghe.",
    "Công việc tạo giá trị cho cộng đồng.",
  ]),
  q("e1", "E", "Bạn cảm thấy điều nào gần với bản thân?", [
    "Tôi thích đưa ra ý tưởng.",
    "Tôi thích dẫn dắt người khác.",
    "Tôi thích đặt mục tiêu.",
    "Tôi thích thuyết phục.",
    "Tôi thích thử thách.",
    "Tôi thích tổ chức công việc.",
  ]),
  q("e2", "E", "Trong học tập và cuộc sống, điều gì khiến bạn hứng thú?", [
    "Tôi thích lập kế hoạch.",
    "Tôi thích đưa ra quyết định.",
    "Tôi thích cải thiện kết quả.",
    "Tôi thích bắt đầu việc mới.",
    "Tôi thích tạo ảnh hưởng.",
  ]),
  q("e3", "E", "Bạn muốn thử kiểu công việc nào?", [
    "Công việc có khả năng phát triển.",
    "Công việc cần lãnh đạo.",
    "Công việc cần giao tiếp.",
    "Công việc có mục tiêu rõ ràng.",
    "Công việc cần chủ động.",
  ]),
  q("c1", "C", "Bạn cảm thấy điều nào gần với bản thân?", [
    "Tôi thích mọi thứ rõ ràng.",
    "Tôi thích làm việc theo kế hoạch.",
    "Tôi chú ý chi tiết.",
    "Tôi thích sự chính xác.",
    "Tôi thích quy trình.",
    "Tôi thích sự ổn định.",
  ]),
  q("c2", "C", "Trong học tập và cuộc sống, điều gì khiến bạn hứng thú?", [
    "Tôi thích làm việc theo từng bước.",
    "Tôi thích sắp xếp thông tin.",
    "Tôi thích kiểm tra lỗi.",
    "Tôi thích hoàn thành theo kế hoạch.",
    "Tôi thích môi trường ngăn nắp.",
  ]),
  q("c3", "C", "Bạn muốn thử kiểu công việc nào?", [
    "Công việc có nhiệm vụ rõ ràng.",
    "Công việc có quy trình ổn định.",
    "Công việc cần sự cẩn thận.",
    "Công việc cần tổ chức thông tin.",
    "Công việc có cách làm khoa học.",
  ]),
];

export function getHollandQuestion(index: number): HollandQuestion | undefined {
  return HOLLAND_QUESTIONS[index];
}
