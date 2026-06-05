import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-slate-200 bg-white/80 dark:border-white/10 dark:bg-black/30">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
              LEXA AI
            </div>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-white/60">
              Hệ sinh thái học tập và định hướng nghề dành cho học sinh Việt Nam — phát triển bởi
              học sinh Trường THCS Bình Sơn.
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-white/45">
              Dữ liệu học tập lưu trên thiết bị; đăng nhập để gắn với tài khoản.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-white/70">
              Module
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <Link className="text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white" href="/test">
                Bài test
              </Link>
              <Link className="text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white" href="/library">
                Thư viện nghề
              </Link>
              <Link className="text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white" href="/chat">
                Trợ lý học tập
              </Link>
              <Link className="text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white" href="/translate">
                Dịch thuật
              </Link>
              <Link className="text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white" href="/practice">
                Luyện tập
              </Link>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-white/70">
              Liên hệ & pháp lý
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-white/60">
              <a
                className="inline-flex w-fit items-center gap-1 text-sky-700 transition hover:text-sky-900 dark:text-cyan-300 dark:hover:text-cyan-200"
                href="mailto:huynhkhang3k@gmail.com"
              >
                huynhkhang3k@gmail.com
              </a>
              <span>Hỗ trợ: Thứ 2 – Thứ 6, 8:00 – 18:00</span>
              <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white">
                Chính sách quyền riêng tư
              </Link>
              <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white">
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-white/10 dark:text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span suppressHydrationWarning>© {year} LEXA AI · Huỳnh Khang · Bùi Hoàng Hải My</span>
          <span>Đồng hành cùng học sinh Việt Nam trên hành trình phát triển.</span>
        </div>
      </Container>
    </footer>
  );
}
