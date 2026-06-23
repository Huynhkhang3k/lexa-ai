"use client";

import { motion } from "framer-motion";
import { RiasecGroupImage } from "@/components/holland/riasec-group-image";
import { BookOpen, Compass, ExternalLink, Flag, Info } from "lucide-react";
import { CareerImage } from "@/components/career/career-image";
import { Button, ButtonLink } from "@/components/ui/button";
import { HollandRadarChart } from "@/components/holland/holland-radar-chart";
import type { HollandResult } from "@/lib/holland-scoring";
import { getRiasecType, RIASEC_GROUP_IMAGES, RIASEC_ORDER, type RiasecCode } from "@/lib/holland-riasec";
import { cn } from "@/lib/utils";

const BAR_COLORS: Record<RiasecCode, string> = {
  R: "bg-red-500",
  I: "bg-orange-500",
  A: "bg-amber-500",
  S: "bg-emerald-500",
  E: "bg-sky-500",
  C: "bg-violet-500",
};

type HollandResultViewProps = {
  result: HollandResult;
  onReset: () => void;
};

function Section({
  step,
  title,
  children,
  className,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-slate-200/80 bg-white/90 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6", className)}>
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
          {step}
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-white/90">
          {title}
        </h3>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-white/80"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function HollandResultView({ result, onReset }: HollandResultViewProps) {
  const scoreDetail = RIASEC_ORDER.map((code) => {
    const g = result.groups.find((x) => x.code === code);
    return `${code}: ${g?.score ?? 0}`;
  }).join(" · ");

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-5">
      <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-900 dark:text-cyan-100">
        <div className="flex items-start gap-2">
          <Compass className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Kết quả dựa trên <strong>Mật mã Holland (RIASEC)</strong> — mô hình John Holland. Đây là định hướng
            tham khảo, không thay tư vấn chuyên môn.
          </p>
        </div>
      </div>

      {/* 1. Mã Holland */}
      <Section step={1} title="Mã Holland của bạn" className="overflow-hidden border-violet-300/40 bg-gradient-to-br from-violet-600/95 via-fuchsia-600/95 to-indigo-700/95 text-white dark:border-violet-500/30">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Mật mã Holland (3 nhóm nổi bật)</p>
          <p className="mt-3 text-5xl font-bold tracking-[0.2em] sm:text-6xl">{result.hollandCode}</p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/85">{result.summary}</p>
        </div>
        <div className="mt-5 rounded-2xl border border-white/20 bg-black/20 p-4 text-left text-xs leading-6 text-white/80">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Info className="h-3.5 w-3.5" />
            Cách tính điểm
          </div>
          <p className="mt-2">{result.scoringNote}</p>
          <p className="mt-2 font-mono text-[11px] text-white/70">{scoreDetail}</p>
        </div>
      </Section>

      {/* 2. Biểu đồ RIASEC */}
      <Section step={2} title="Biểu đồ RIASEC">
        <div className="grid gap-6 lg:grid-cols-2">
          <HollandRadarChart
            data={result.radarValues.map((r) => ({
              code: r.code,
              label: getRiasecType(r.code).labelVi,
              value: r.value,
            }))}
          />
          <div className="space-y-2.5">
            {result.groups.map((g) => (
              <div key={g.code}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-white/80">
                    {g.code} — {g.labelVi}
                  </span>
                  <span className="text-slate-500 dark:text-white/50">{g.score} điểm</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className={cn("h-full rounded-full", BAR_COLORS[g.code])} style={{ width: `${g.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 3. Top 3 nhóm */}
      <Section step={3} title="Ba nhóm nổi bật nhất">
        <div className="grid gap-3 sm:grid-cols-3">
          {result.topGroups.map((g, i) => (
            <div
              key={g.code}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-white/10 dark:bg-black/20"
            >
              <RiasecGroupImage src={RIASEC_GROUP_IMAGES[g.code]} alt={g.labelVi} compact />
              <div className="p-3">
                <div className="text-[10px] font-bold uppercase text-violet-600 dark:text-fuchsia-300">Hạng {i + 1}</div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {g.code} — {g.labelVi}
                </div>
                <div className="text-xs text-slate-500 dark:text-white/50">{g.labelEn} · {g.score} điểm</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Giải thích từng nhóm */}
      <Section step={4} title="Giải thích từng nhóm trong mã Holland">
        <div className="space-y-4">
          {result.groupExplanations.map((g) => {
            const t = getRiasecType(g.code);
            return (
              <div
                key={g.code}
                className={cn("rounded-2xl border p-4", t.bg, "border-slate-200/80 dark:border-white/10")}
              >
                <div className={cn("text-sm font-bold", t.color)}>
                  {g.code} — {g.labelVi} ({g.labelEn})
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-white/70">{g.shortDesc}</p>
                <p className="mt-2 text-sm leading-7 text-slate-800 dark:text-white/85">{g.personality}</p>
                <p className="mt-2 text-xs font-medium text-sky-800 dark:text-cyan-300">{g.whyFit}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 5. Điểm mạnh */}
      <Section step={5} title="Điểm mạnh">
        <TagList items={result.strengths} />
      </Section>

      {/* 6. Điểm cần cải thiện */}
      <Section step={6} title="Điểm cần cải thiện / cân bằng thêm">
        <ul className="space-y-2 text-sm leading-7 text-slate-700 dark:text-white/75">
          {result.areasToImprove.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* 7–9 */}
      <Section step={7} title="Môi trường học tập phù hợp">
        <p className="text-sm leading-7 text-slate-700 dark:text-white/75">{result.learningEnv}</p>
      </Section>

      <Section step={8} title="Môi trường làm việc phù hợp">
        <p className="text-sm leading-7 text-slate-700 dark:text-white/75">{result.workEnv}</p>
      </Section>

      <Section step={9} title="Kỹ năng nên phát triển">
        <TagList items={result.skillsToDevelop} />
      </Section>

      {/* 10–11 */}
      <Section step={10} title="Lĩnh vực phù hợp">
        <TagList items={result.suitableFields} />
      </Section>

      <Section step={11} title="Ngành học phù hợp">
        <TagList items={result.suitableMajors} />
      </Section>

      {/* 12. Nghề — cuối cùng, không bắt chọn mục tiêu */}
      <Section step={12} title="Gợi ý nghề nghiệp (tham khảo)">
        <p className="mb-4 text-sm text-slate-600 dark:text-white/60">
          Danh sách dưới đây chỉ xuất hiện sau khi bạn đã hiểu mã Holland và các nhóm RIASEC. Bạn{" "}
          <strong className="text-slate-800 dark:text-white">không cần chọn nghề ngay</strong> — hãy khám phá thư
          viện và trao đổi thêm khi đã sẵn sàng.
        </p>
        <div className="grid gap-4">
          {result.careers.map((c, index) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
            >
              <div className="grid sm:grid-cols-[120px,1fr]">
                <div className="relative min-h-[120px]">
                  {c.careerImageUrl ? (
                    <CareerImage careerId={c.id} alt={c.name} className="h-full min-h-[120px] rounded-none" />
                  ) : (
                    <RiasecGroupImage src={c.groupImageUrl} alt={c.primaryLabel} compact className="min-h-[120px] rounded-none" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {index === 0 ? (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800 dark:bg-fuchsia-500/25 dark:text-fuchsia-200">
                        Khớp RIASEC cao
                      </span>
                    ) : null}
                    <span className="rounded-full border border-emerald-300/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
                      {c.primaryLabel} ({c.riasecPrimary})
                    </span>
                  </div>
                  <h4 className="mt-2 font-semibold text-slate-900 dark:text-white">{c.name}</h4>
                  <p className="text-sm text-sky-700 dark:text-cyan-300/90">{c.tagline}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/60">{c.why}</p>
                  <ButtonLink
                    href={`/library?career=${c.id}`}
                    variant="secondary"
                    size="sm"
                    className="mt-3 gap-1.5"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Xem trong thư viện
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </ButtonLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bước tiếp theo gợi ý</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-white/75">
          {result.nextSteps.map((s) => (
            <li key={s} className="flex gap-2">
              <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <ButtonLink href="/roadmap" className="flex-1 justify-center" size="lg">
          Xem lộ trình nghề nghiệp
        </ButtonLink>
        <ButtonLink href={`/library?riasec=${result.topGroups[0]?.code ?? "I"}`} className="flex-1 justify-center" size="lg" variant="secondary">
          Khám phá thư viện nghề
        </ButtonLink>
        <Button onClick={onReset} variant="secondary" size="lg">
          Làm lại
        </Button>
      </div>
    </motion.div>
  );
}
