import { Briefcase, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { SAMPLE_ANALYSIS } from "@/lib/landing-data";

export function SampleAnalysisSection() {
  const data = SAMPLE_ANALYSIS;

  return (
    <section>
      <SectionHeading
        eyebrow="Chứng minh giá trị"
        title="LEXA phân tích như thế nào?"
        description="Không chỉ mô tả — đây là ví dụ kết quả thực tế bạn sẽ nhận được sau bài test khám phá bản thân."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden border-sky-200/60 dark:border-cyan-500/20">
          <CardHeader className="border-b border-slate-200/80 bg-slate-50/80 pb-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-white/50">
                  {data.studentLabel}
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  Hồ sơ học sinh THCS · Khối 9
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 px-3 py-2 text-center text-white">
                <div className="text-2xl font-bold leading-none">{data.matchScore}%</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wide opacity-90">
                  Phù hợp
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Sparkles className="h-4 w-4 text-sky-600 dark:text-cyan-300" />
                Điểm mạnh
              </div>
              <ul className="mt-3 space-y-2">
                {data.strengths.map((s) => (
                  <li
                    key={s}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/80"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-cyan-400" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Briefcase className="h-4 w-4 text-violet-600 dark:text-fuchsia-300" />
                Gợi ý nghề
              </div>
              <ul className="mt-3 space-y-2">
                {data.careers.map((c, i) => (
                  <li
                    key={c}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <span className="font-medium text-slate-800 dark:text-white/90">{c}</span>
                    {i === 0 ? (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                        Top match
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                Phong cách học tập
              </div>
              <p className="mt-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/65">
                {data.learningStyle}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border-violet-200/60 bg-gradient-to-b from-violet-50/80 to-white dark:border-fuchsia-500/20 dark:from-fuchsia-500/[0.08] dark:to-transparent">
          <CardContent className="p-5">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Bạn cũng có thể nhận kết quả như vậy
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/60">
              Làm bài test 10 phút — LEXA phân tích sở thích, năng lực và phong cách học để gợi ý
              ngành nghề phù hợp nhất.
            </p>
          </CardContent>
          <div className="border-t border-violet-200/50 p-5 pt-0 dark:border-fuchsia-500/15">
            <ButtonLink href="/test" className="w-full justify-center">
              Làm bài test ngay
            </ButtonLink>
          </div>
        </Card>
      </div>
    </section>
  );
}
