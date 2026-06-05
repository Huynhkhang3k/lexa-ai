import { ArrowRight, Bot, Library, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SchoolLogo } from "@/components/site/school-logo";
import { CareerMapCard } from "@/components/home/career-map-card";
import { CareerPreviewSection } from "@/components/home/career-preview-section";
import { CareerRoadmapSection } from "@/components/home/career-roadmap-section";
import { EcosystemSection } from "@/components/home/ecosystem-section";
import { AssessmentMethodologySection } from "@/components/holland/assessment-methodology-section";
import { HollandLatestResultSection } from "@/components/home/holland-latest-result-section";
import { HollandRiasecSection } from "@/components/home/holland-riasec-section";
import { JourneySection } from "@/components/home/journey-section";
import { PersonalProfileSection } from "@/components/home/personal-profile-section";
import { ProgressDashboardSection } from "@/components/home/progress-dashboard-section";
import { SampleAnalysisSection } from "@/components/home/sample-analysis-section";
import { TrustSection } from "@/components/home/trust-section";
import { AUTHORS, SCHOOL_NAME } from "@/lib/brand";

export default function Home() {
  return (
    <div className="py-10 sm:py-14">
      <Container className="space-y-20 sm:space-y-24">
        {/* Hero — LEXA là gì, bắt đầu từ đâu */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)] sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_30%_30%,rgba(14,165,233,0.08),transparent_55%)] dark:bg-[radial-gradient(900px_circle_at_30%_30%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(700px_circle_at_85%_25%,rgba(217,70,239,0.14),transparent_55%)]" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50/90 px-3 py-1 text-xs font-semibold tracking-wide text-sky-800 dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                Hệ sinh thái học tập & phát triển tương lai
              </div>

              <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-sm dark:border-white/12 dark:bg-white/[0.06]">
                <SchoolLogo size="md" />
                <div className="leading-relaxed">
                  <div className="font-semibold tracking-wide text-slate-800 dark:text-white/90">
                    {AUTHORS.join(" · ")}
                  </div>
                  <div className="text-slate-600 dark:text-white/60">{SCHOOL_NAME}</div>
                </div>
              </div>

              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Người đồng hành giúp bạn khám phá bản thân và xây dựng tương lai
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-slate-600 dark:text-white/70">
                <strong className="font-semibold text-slate-800 dark:text-white/90">
                  LEXA AI
                </strong>{" "}
                là hệ sinh thái học tập dành cho học sinh Việt Nam. Bắt đầu bằng bài test{" "}
                <strong className="font-semibold text-slate-800 dark:text-white/90">
                  Holland RIASEC (18 câu)
                </strong>
                , nhận mã định hướng và lộ trình nghề, học cùng AI và theo dõi tiến độ mỗi ngày.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { q: "LEXA là gì?", a: "Hệ sinh thái phát triển toàn diện" },
                  { q: "Bắt đầu từ đâu?", a: "Test Holland RIASEC — 18 câu" },
                  { q: "Vì sao quay lại?", a: "Theo dõi hành trình cá nhân" },
                ].map((item) => (
                  <div
                    key={item.q}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-white/10 dark:bg-black/20"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:text-cyan-300">
                      {item.q}
                    </div>
                    <div className="mt-1 text-xs font-medium leading-snug text-slate-800 dark:text-white/85">
                      {item.a}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <ButtonLink href="/test" className="justify-center" size="lg">
                  Bắt đầu tại bài test
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink
                  href="#roadmap"
                  variant="secondary"
                  size="lg"
                  className="justify-center"
                >
                  Xem lộ trình nghề nghiệp
                </ButtonLink>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-sky-200/40 via-blue-100/30 to-violet-200/30 blur-2xl dark:from-cyan-400/20 dark:via-blue-500/10 dark:to-fuchsia-500/20" />
              <div className="relative grid gap-4">
                <CareerMapCard />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        Trợ lý học tập AI
                      </div>
                      <Bot className="h-5 w-5 text-violet-600 dark:text-fuchsia-300" />
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-slate-600 dark:text-white/60">
                      Module trong hệ sinh thái — giải bài, ôn thi, định hướng học tập.
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        Thư viện nghề
                      </div>
                      <Library className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-slate-600 dark:text-white/60">
                      60+ nghề với lương, kỹ năng và lộ trình phát triển tại Việt Nam.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <JourneySection />
        <HollandRiasecSection />
        <HollandLatestResultSection />
        <AssessmentMethodologySection />
        <CareerRoadmapSection />
        <SampleAnalysisSection />
        <PersonalProfileSection />
        <CareerPreviewSection />
        <ProgressDashboardSection />
        <TrustSection />
        <EcosystemSection />

        {/* CTA */}
        <section>
          <Card className="relative overflow-hidden border-sky-200/60 dark:border-cyan-500/20">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/50 via-transparent to-violet-50/40 dark:from-cyan-500/5 dark:to-fuchsia-500/5" />
            <CardContent className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-cyan-300">
                    Sẵn sàng bắt đầu?
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
                    Khám phá bản thân → Định hướng nghề → Học tập → Phát triển kỹ năng → Xây
                    dựng tương lai
                  </div>
                  <div className="mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-white/60">
                    LEXA đồng hành cùng bạn trên toàn bộ hành trình — bắt đầu với bài test miễn
                    phí, chỉ mất khoảng 10 phút.
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/test" size="lg" className="justify-center">
                    Bắt đầu hành trình <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink href="/library" variant="secondary" size="lg" className="justify-center">
                    Khám phá nghề
                  </ButtonLink>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </Container>
    </div>
  );
}
