"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "lucide-react";
import { RiasecGroupImage } from "@/components/holland/riasec-group-image";
import { SectionHeading } from "./section-heading";
import {
  HOLLAND_RIASEC_DIAGRAM_URL,
  RIASEC_TYPES,
  type RiasecCode,
} from "@/lib/holland-riasec";
import { cn } from "@/lib/utils";

type HollandRiasecSectionProps = {
  variant?: "home" | "test" | "test-intro";
  className?: string;
  onStartTest?: () => void;
};

function RiasecGroupCard({ code, compact }: { code: RiasecCode; compact?: boolean }) {
  const t = RIASEC_TYPES.find((x) => x.code === code)!;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-white/[0.06]",
        t.ring,
        compact ? "border-white/15" : "border-slate-200/80 dark:border-white/10",
      )}
    >
      <RiasecGroupImage src={t.imageUrl} alt={t.labelVi} compact={compact} />
      <div className={cn("p-3", compact && "p-2.5")}>
        <div className={cn("text-lg font-bold", t.color)}>{code}</div>
        <div className={cn("font-semibold text-slate-900 dark:text-white", compact && "text-sm")}>
          {t.labelVi}
        </div>
        <div className="text-xs italic text-slate-500 dark:text-white/50">{t.labelEn}</div>
        {!compact ? (
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-white/60">{t.shortDesc}</p>
        ) : null}
      </div>
    </motion.div>
  );
}

export function HollandRiasecSection({ variant = "home", className, onStartTest }: HollandRiasecSectionProps) {
  if (variant === "test-intro") {
    return (
      <div className={cn("mb-8 space-y-6", className)}>
        <div className="overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-violet-300">
            <Compass className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Trước khi bắt đầu</span>
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">Mật mã Holland (RIASEC)</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
            Đây là mô hình hướng nghiệp do nhà tâm lý học <strong className="text-white">John Holland</strong> phát
            triển. RIASEC chia sở thích nghề nghiệp thành <strong className="text-white">6 nhóm</strong>; mỗi người có
            tổ hợp <strong className="text-white">3 nhóm nổi bật nhất</strong> — gọi là <strong className="text-white">Mật mã Holland</strong>{" "}
            (ví dụ: ISR, SAE, RIA, SEC…).
          </p>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {RIASEC_TYPES.map((t) => (
              <li key={t.code} className={cn("rounded-xl border border-white/10 px-3 py-2", t.bg)}>
                <span className={cn("font-bold", t.color)}>{t.code}</span>
                <span className="text-white/90"> — {t.labelVi}</span>
                <span className="text-white/50"> ({t.labelEn})</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-sm leading-7 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 sm:p-6">
          <p className="font-semibold text-slate-900 dark:text-white">Cấu trúc bài test LEXA AI</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>18 câu</strong> — 3 câu cho mỗi nhóm R, I, A, S, E, C (nội dung chuẩn Holland, không câu ngẫu
              nhiên).
            </li>
            <li>Mỗi câu có <strong>6 lựa chọn</strong>; bạn chọn <strong>nhiều đáp án</strong> phù hợp.</li>
            <li>Mỗi lựa chọn = <strong>+1 điểm</strong> cho nhóm tương ứng.</li>
            <li>Kết quả: mã Holland → giải thích nhóm → ngành/lĩnh vực → <strong>nghề gợi ý ở cuối</strong> (không bắt chọn nghề ngay).</li>
          </ul>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RIASEC_TYPES.map((t) => (
            <RiasecGroupCard key={t.code} code={t.code} compact />
          ))}
        </div>

        {onStartTest ? (
          <div className="text-center">
            <button
              type="button"
              onClick={onStartTest}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-95"
            >
              Bắt đầu bài test (18 câu)
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "test") {
    return (
      <div
        className={cn(
          "mb-6 rounded-2xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm text-violet-900 dark:text-violet-100",
          className,
        )}
      >
        <span className="font-semibold">Holland RIASEC</span> · Câu {/** filled by parent */} — chọn nhiều đáp án, mỗi
        lựa chọn +1 điểm nhóm tương ứng.
      </div>
    );
  }

  return (
    <section id="holland-riasec" className={cn("scroll-mt-24", className)}>
      <SectionHeading
        eyebrow="Nền tảng khoa học"
        title="Mật mã Holland (RIASEC)"
        description="Mô hình định hướng nghề nghiệp do nhà tâm lý học John Holland phát triển — chia sở thích thành 6 nhóm, là chuẩn mực phổ biến trên thế giới và nền tảng của bài test LEXA AI."
        align="center"
      />

      <div className="mt-8 space-y-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200/80 bg-white/90 p-5 text-sm leading-7 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70 sm:p-6">
          <p>
            <strong className="text-slate-900 dark:text-white">RIASEC</strong> gồm sáu chữ cái:{" "}
            <strong>R</strong> (Kỹ thuật), <strong>I</strong> (Nghiên cứu), <strong>A</strong> (Nghệ thuật),{" "}
            <strong>S</strong> (Xã hội), <strong>E</strong> (Quản lý / Kinh doanh), <strong>C</strong> (Nghiệp vụ / Hành chính).
            Sau bài test, LEXA xác định <strong className="text-slate-900 dark:text-white">mã Holland</strong> từ ba nhóm điểm cao nhất của bạn (ví dụ: ISA, SEC…).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RIASEC_TYPES.map((t) => (
            <RiasecGroupCard key={t.code} code={t.code} />
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-900 to-slate-950 p-6 dark:border-white/10 sm:p-8">
          <div className="mx-auto max-w-lg">
            <Image
              src={HOLLAND_RIASEC_DIAGRAM_URL}
              alt="Sơ đồ 6 nhóm Holland RIASEC"
              width={640}
              height={640}
              unoptimized
              className="mx-auto w-full object-contain"
            />
          </div>
          <p className="mt-4 text-center text-xs text-white/50">
            Sơ đồ 6 nhóm tính cách nghề nghiệp Holland
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/test"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:opacity-95"
          >
            Làm bài test Holland (18 câu)
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
