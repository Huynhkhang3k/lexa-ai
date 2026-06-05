import { Container } from "@/components/ui/container";

export const metadata = {
  title: "Điều khoản sử dụng — LEXA AI",
};

export default function TermsPage() {
  return (
    <Container className="py-10 sm:py-14">
      <article className="prose prose-slate mx-auto max-w-3xl dark:prose-invert">
        <h1>Điều khoản sử dụng</h1>
        <p className="lead text-slate-600 dark:text-white/70">
          Khi dùng LEXA AI, bạn đồng ý các điều khoản dưới đây. Đây là sản phẩm thử nghiệm do học
          sinh phát triển.
        </p>

        <h2>Mục đích sử dụng</h2>
        <p>
          LEXA hỗ trợ học tập, khám phá bản thân và định hướng nghề nghiệp. Không dùng để gian lận
          thi cử, bắt nạt, hoặc phát tán nội dung có hại.
        </p>

        <h2>Kết quả AI</h2>
        <p>
          Gợi ý nghề nghiệp và câu trả lời AI mang tính tham khảo, không thay thế tư vấn chuyên
          nghiệp hay quyết định tuyển sinh chính thức.
        </p>

        <h2>Tài khoản</h2>
        <p>
          Bạn chịu trách nhiệm bảo mật tài khoản. Không chia sẻ mật khẩu. Đăng nhập Google được
          khuyến khích trên phiên bản web công khai.
        </p>

        <h2>Giới hạn trách nhiệm</h2>
        <p>
          LEXA AI được cung cấp &quot;nguyên trạng&quot;. Nhóm phát triển không chịu trách nhiệm
          về thiệt hại phát sinh từ việc sử dụng sản phẩm trong giai đoạn thử nghiệm.
        </p>

        <h2>Liên hệ</h2>
        <p>
          Thắc mắc về điều khoản:{" "}
          <a href="mailto:huynhkhang3k@gmail.com">huynhkhang3k@gmail.com</a>
        </p>

        <p className="text-sm text-slate-500">
          Cập nhật lần cuối: {new Date().getFullYear()}.
        </p>
      </article>
    </Container>
  );
}
