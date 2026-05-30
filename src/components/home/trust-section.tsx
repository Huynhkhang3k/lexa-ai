import { Card, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "./section-heading";
import { TRUST_FACTORS } from "@/lib/landing-data";

export function TrustSection() {
  return (
    <section>
      <SectionHeading
        eyebrow="Độ tin cậy"
        title="Tại sao kết quả của LEXA đáng tin cậy?"
        description="Mỗi gợi ý được xây dựng từ dữ liệu cá nhân của bạn — không phải câu trả lời chung chung cho tất cả mọi người."
        align="center"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {TRUST_FACTORS.map((item) => (
          <Card
            key={item.title}
            className="transition hover:border-sky-200/80 dark:hover:border-cyan-400/25"
          >
            <CardHeader className="flex flex-row items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-cyan-400/10">
                <item.icon className="h-5 w-5 text-sky-600 dark:text-cyan-300" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/60">
                  {item.desc}
                </p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
