"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { getUserProfile, hasCompletedAssessment } from "@/lib/user-profile";
import { TRAIT_LABELS } from "@/lib/test-scoring";
import type { TraitId } from "@/lib/test-scoring";

export function SampleAnalysisSection() {
  const [profile, setProfile] = React.useState(getUserProfile);
  const hasOwn = hasCompletedAssessment();

  React.useEffect(() => {
    const refresh = () => setProfile(getUserProfile());
    window.addEventListener("lexa-profile-updated", refresh);
    return () => window.removeEventListener("lexa-profile-updated", refresh);
  }, []);

  if (hasOwn && profile.suggestedCareers?.length) {
    return (
      <section>
        <SectionHeading
          eyebrow="Kết quả của bạn"
          title="Phân tích từ bài đánh giá"
          description="Output từ câu trả lời của bạn — không phải nội dung mẫu chung."
        />
        <Card className="mt-8">
          <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
            {profile.insights?.length ? (
              <div>
                <div className="text-xs font-semibold uppercase text-slate-500">LEXA nhận thấy</div>
                <ul className="mt-2 space-y-2 text-sm">
                  {profile.insights.map((s) => (
                    <li key={s}>→ {s}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div>
              <div className="text-xs font-semibold uppercase text-slate-500">Gợi ý nghề</div>
              <ul className="mt-2 space-y-2">
                {profile.suggestedCareers.slice(0, 3).map((c) => (
                  <li key={c.id} className="rounded-xl border px-3 py-2 text-sm">
                    {c.name}{" "}
                    <span className="text-sky-700 dark:text-cyan-300">{c.matchPercent}%</span>
                  </li>
                ))}
              </ul>
            </div>
            {profile.topTraits?.length ? (
              <div className="flex flex-wrap items-center gap-2 text-xs sm:col-span-2">
                <span className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-white/10">Input</span>
                <ArrowRight className="h-3 w-3" />
                <span className="rounded-lg bg-sky-100 px-2 py-1 dark:bg-cyan-400/15">
                  {profile.topTraits.map((t: TraitId) => TRAIT_LABELS[t]).join(", ")}
                </span>
                <ArrowRight className="h-3 w-3" />
                <span className="rounded-lg bg-violet-100 px-2 py-1">
                  {profile.suggestedCareers[0]?.name}
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading
        eyebrow="Cách LEXA phân tích"
        title="Input → Phân tích → Output"
        description="LEXA không hiển thị gợi ý nghề trước khi có dữ liệu từ bạn."
      />
      <Card className="mt-8 border-dashed">
        <CardContent className="p-8 text-center">
          <ButtonLink href="/test" className="mt-2 justify-center">
            Bắt đầu đánh giá để xem kết quả
          </ButtonLink>
        </CardContent>
      </Card>
    </section>
  );
}
