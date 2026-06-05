import { Container } from "@/components/ui/container";

export const metadata = {
  title: "Chính sách quyền riêng tư — LEXA AI",
};

export default function PrivacyPage() {
  return (
    <Container className="py-10 sm:py-14">
      <article className="prose prose-slate mx-auto max-w-3xl dark:prose-invert">
        <h1>Chính sách quyền riêng tư</h1>
        <p className="lead text-slate-600 dark:text-white/70">
          LEXA AI dành cho học sinh Việt Nam. Chúng tôi tôn trọng quyền riêng tư, đặc biệt với
          người dùng dưới 18 tuổi.
        </p>

        <h2>Chúng tôi thu thập gì</h2>
        <ul>
          <li>Email và tên (khi bạn đăng nhập bằng Google hoặc email)</li>
          <li>Khối lớp bạn chọn</li>
          <li>Câu trả lời bài test, lịch sử chat, dịch thuật và luyện tập — đồng bộ theo tài khoản khi bạn đăng nhập</li>
        </ul>

        <h2>Cách lưu trữ</h2>
        <p>
          Khi đăng nhập, dữ liệu học tập được lưu trên máy chủ LEXA và đồng bộ giữa các thiết bị
          (cùng tài khoản). Dữ liệu không được bán cho bên thứ ba.
        </p>

        <h2>AI xử lý nội dung</h2>
        <p>
          Câu hỏi và bài làm có thể được gửi tới máy chủ LEXA để AI trả lời. Khóa AI không hiển
          thị trên trình duyệt. Vui lòng không gửi thông tin nhạy cảm (mật khẩu, số điện thoại
          người khác, v.v.).
        </p>

        <h2>Quyền của bạn</h2>
        <p>
          Bạn có thể xóa dữ liệu bằng cách xóa cache trình duệt hoặc liên hệ{" "}
          <a href="mailto:huynhkhang3k@gmail.com">huynhkhang3k@gmail.com</a> để được hỗ trợ.
        </p>

        <h2>Phụ huynh & giáo viên</h2>
        <p>
          Nếu con em hoặc học sinh dùng LEXA, phụ huynh/giáo viên nên hướng dẫn cách sử dụng an
          toàn và không chia sẻ thông tin cá nhân trong chat.
        </p>

        <p className="text-sm text-slate-500">
          Cập nhật lần cuối: {new Date().getFullYear()}. Dự án học sinh — Trường THCS Bình Sơn.
        </p>
      </article>
    </Container>
  );
}
