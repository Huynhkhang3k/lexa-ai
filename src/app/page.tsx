import { ArrowRight, Bot, Library } from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { CareerMapCard } from "@/components/home/career-map-card";
import { AUTHORS, BINH_SON_LOGO_URL, SCHOOL_NAME } from "@/lib/brand";

export default function Home() {
  return (
    <div className="py-10 sm:py-14">
      <Container>
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)] sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_30%_30%,rgba(14,165,233,0.08),transparent_55%)] dark:bg-[radial-gradient(900px_circle_at_30%_30%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(700px_circle_at_85%_25%,rgba(217,70,239,0.14),transparent_55%)]" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-white/12 dark:bg-white/8">
                <Image
                  src={BINH_SON_LOGO_URL}
                  alt={SCHOOL_NAME}
                  width={36}
                  height={36}
                  className="shrink-0 rounded-full"
                />
                <div className="leading-relaxed">
                  <div className="font-semibold tracking-wide text-slate-800 dark:text-white/90">
                    {AUTHORS.join(" · ")}
                  </div>
                  <div className="text-slate-600 dark:text-white/60">{SCHOOL_NAME}</div>
                </div>
              </div>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                LEXA AI hỗ trợ bạn định hướng đúng ngành, nghề — nhanh và tự tin.
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-slate-600 dark:text-white/70">
                Làm bài test tính cách, khám phá thư viện nghề tại Việt Nam, chat
                với trợ lý AI và tạo bộ luyện tập theo môn học — tất cả trong một
                trải nghiệm giao diện tương lai, mượt mà.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <ButtonLink href="/test" className="justify-center" size="lg">
                  Bắt đầu bài test
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink
                  href="/library"
                  variant="secondary"
                  size="lg"
                  className="justify-center"
                >
                  Xem thư viện nghề
                </ButtonLink>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { label: "Bài test", value: "10+" },
                  { label: "Nghề phổ biến", value: "60+" },
                  { label: "Gợi ý", value: "Cá nhân hoá" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20"
                  >
                    <div className="text-xs text-slate-500 dark:text-white/60">
                      {s.label}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-sky-200/40 via-blue-100/30 to-violet-200/30 blur-2xl dark:from-cyan-400/20 dark:via-blue-500/10 dark:to-fuchsia-500/20" />
              <div className="relative grid gap-4">
                <CareerMapCard />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        Trợ lý học tập AI
                      </div>
                      <Bot className="h-5 w-5 text-violet-600 dark:text-fuchsia-300" />
                    </CardHeader>
                    <CardContent className="pt-1 text-sm text-slate-600 dark:text-white/60">
                      Giải thích bài, ôn thi, kỹ năng học & định hướng nghề — có lịch sử chat.
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        Thư viện nghề
                      </div>
                      <Library className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </CardHeader>
                    <CardContent className="pt-1 text-sm text-slate-600 dark:text-white/60">
                      Mô tả, kỹ năng, lương trung bình và triển vọng tại Việt
                      Nam.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60">
              Tính năng nổi bật
            </div>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Một trải nghiệm định hướng nghề nghiệp đáng tin cậy
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Bài test nhiều lựa chọn",
                desc: "Thang tiến độ rõ ràng, giao diện thẻ hiện đại, kết quả & gợi ý nghề.",
              },
              {
                title: "Thư viện nghề Việt Nam",
                desc: "Tìm kiếm nhanh, card đẹp, xem chi tiết: kỹ năng, lương, môn liên quan.",
              },
              {
                title: "Luyện tập theo môn học",
                desc: "Chọn môn · độ khó · số câu, hiển thị đề luyện tập dạng AI-generated.",
              },
            ].map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {f.title}
                  </div>
                </CardHeader>
                <CardContent className="pt-2 text-sm leading-6 text-slate-600 dark:text-white/60">
                  {f.desc}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60">
                    Ready?
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
                    Bắt đầu hành trình chọn nghề phù hợp ngay hôm nay.
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-white/60">
                    UI MVP — tập trung trải nghiệm, backend sẽ nâng cấp sau.
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/test" size="lg" className="justify-center">
                    Làm bài test <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink
                    href="/library"
                    variant="secondary"
                    size="lg"
                    className="justify-center"
                  >
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
