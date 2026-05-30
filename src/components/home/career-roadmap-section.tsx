"use client";

import * as React from "react";
import { Flag, Route, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import {
  getUserProfile,
  hasCompletedAssessment,
  hasRoadmap,
} from "@/lib/user-profile";
import { cn } from "@/lib/utils";

export function CareerRoadmapSection() {
  const [profile, setProfile] = React.useState(getUserProfile);
  const ready = hasRoadmap();
  const assessed = hasCompletedAssessment();

  React.useEffect(() => {
    const refresh = () => setProfile(getUserProfile());
    window.addEventListener("lexa-profile-updated", refresh);
    window.addEventListener("lexa-activity-updated", refresh);
    return () => {
      window.removeEventListener("lexa-profile-updated", refresh);
      window.removeEventListener("lexa-activity-updated", refresh);
    };
  }, []);

  return (
    <section id="roadmap" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Lộ trình phát triển"
        title="AI Career Roadmap"
        description={
          ready
            ? "Lộ trình được tạo từ kết quả đánh giá và nghề mục tiêu bạn đã chọn."
            : "Khám phá lộ trình phát triển dành riêng cho bạn — bắt đầu bằng đánh giá bản thân."
        }
        align="center"
      />

      {!ready ? (
        <div className="mt-8 rounded-3xl border border-dashed border-sky-300/80 bg-sky-50/50 p-8 text-center dark:border-cyan-400/30 dark:bg-cyan-400/[0.06] sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-white/10">
            <Route className="h-7 w-7 text-sky-600 dark:text-cyan-300" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">
            Khám phá lộ trình phát triển dành riêng cho bạn
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-white/60">
            {assessed
              ? "Bạn đã hoàn thành đánh giá — hãy chọn nghề mục tiêu để LEXA vẽ lộ trình."
              : "Hoàn thành bài đánh giá, chọn nghề mục tiêu — lộ trình sẽ được tạo dựa trên câu trả lời của bạn."}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {!assessed ? (
              <ButtonLink href="/test" size="lg" className="justify-center">
                Bắt đầu đánh giá
              </ButtonLink>
            ) : (
              <ButtonLink href="/test" variant="secondary" size="lg" className="justify-center">
                Chọn nghề nghiệp mục tiêu
              </ButtonLink>
            )}
            <ButtonLink href="/library" variant="secondary" size="lg" className="justify-center">
              Khám phá thư viện nghề
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-white to-violet-50/60 p-6 dark:border-cyan-500/25 dark:from-cyan-500/[0.08] dark:via-[#0a0b14] dark:to-fuchsia-500/[0.06] sm:p-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-4 py-1.5 text-xs font-medium dark:border-cyan-400/25 dark:bg-white/10">
              <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-300" />
              Mục tiêu của bạn
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {profile.targetCareer?.name}
            </h3>
          </div>

          <div className="relative mx-auto mt-8 max-w-xl space-y-3">
            {profile.roadmap?.map((step, i) => (
              <div key={`${step.label}-${i}`} className="flex justify-center">
                <div
                  className={cn(
                    "w-full max-w-md rounded-2xl border px-4 py-3 shadow-sm",
                    step.isGoal
                      ? "border-fuchsia-300/70 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                      : "border-slate-200/80 bg-white/95 dark:border-white/12 dark:bg-white/[0.06]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        step.isGoal
                          ? "bg-white/20"
                          : "bg-sky-100 text-sky-700 dark:bg-cyan-400/15 dark:text-cyan-200",
                      )}
                    >
                      {step.isGoal ? <Flag className="h-4 w-4" /> : i + 1}
                    </div>
                    <div>
                      <div
                        className={cn(
                          "text-sm font-semibold",
                          step.isGoal ? "text-white" : "text-slate-900 dark:text-white",
                        )}
                      >
                        {step.label}
                      </div>
                      <div
                        className={cn(
                          "text-xs",
                          step.isGoal ? "text-white/85" : "text-slate-500 dark:text-white/55",
                        )}
                      >
                        {step.focus}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
