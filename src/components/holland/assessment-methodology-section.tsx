import { SectionHeading } from "@/components/home/section-heading";
import { ClipboardList } from "lucide-react";

export function AssessmentMethodologySection() {
  return (
    <section id="phuong-phap-danh-gia" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Minh bạch"
        title="Phương pháp đánh giá"
        align="center"
      />
      <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-cyan-400/15 dark:text-cyan-300">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div className="space-y-4 text-sm leading-7 text-slate-600 dark:text-white/70">
            <p>
              Hệ thống hướng nghiệp của <strong className="text-slate-900 dark:text-white">LEXA AI</strong>{" "}
              được xây dựng dựa trên <strong className="text-slate-900 dark:text-white">Mật mã Holland (RIASEC)</strong>{" "}
              — mô hình định hướng nghề nghiệp phổ biến toàn cầu, do nhà tâm lý học John Holland phát triển.
            </p>
            <p>
              Bài test gồm <strong className="text-slate-900 dark:text-white">18 câu hỏi</strong> (3 câu cho mỗi nhóm R–I–A–S–E–C).
              Mỗi câu có nhiều lựa chọn chi tiết; mỗi lựa chọn bạn chọn được cộng <strong className="text-slate-900 dark:text-white">+1 điểm</strong> cho nhóm tương ứng.
              Sau đó hệ thống xác định <strong className="text-slate-900 dark:text-white">mã Holland</strong> từ 3 nhóm điểm cao nhất và gợi ý lĩnh vực, ngành học, nghề nghiệp phù hợp.
            </p>
            <p className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-amber-900 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-100">
              Kết quả chỉ mang tính chất <strong>tham khảo định hướng</strong> và không thay thế cho tư vấn chuyên môn
              từ giáo viên, nhà tâm lý hoặc chuyên gia hướng nghiệp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
