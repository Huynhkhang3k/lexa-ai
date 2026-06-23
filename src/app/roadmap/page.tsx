"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Flag, Route, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { HollandRadarChart } from "@/components/holland/holland-radar-chart";
import { CareerImage } from "@/components/career/career-image";
import { hasCareerImage } from "@/lib/career-images";
import { getRiasecType } from "@/lib/holland-riasec";
import { getUserProfile, hasCompletedAssessment, type UserProfile } from "@/lib/user-profile";
import { cn } from "@/lib/utils";

export default function RoadmapPage() {
  const [profile, setProfile] = React.useState<UserProfile>({});

  React.useEffect(() => {
    const refresh = () => setProfile(getUserProfile());
    refresh();
    window.addEventListener("lexa-profile-updated", refresh);
    return () => window.removeEventListener("lexa-profile-updated", refresh);
  }, []);

  const holland = profile.hollandResult;
  const roadmap = Array.isArray(profile.roadmap) ? profile.roadmap : [];
  const assessed = hasCompletedAssessment();

  if (!assessed || !holland?.hollandCode) {
    return (
      <Container className="py-12 sm:py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-sky-300/80 bg-sky-50/50 p-8 text-center dark:border-cyan-400/30 dark:bg-cyan-400/[0.06]">
          <Route className="mx-auto h-10 w-10 text-sky-600 dark:text-cyan-300" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
            Chưa có lộ trình cá nhân
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
            Hoàn thành bài test Holland RIASEC để LEXA tạo lộ trình hướng nghiệp dựa trên điểm số thật của bạn.
          </p>
          <ButtonLink href="/test" className="mt-6">
            Làm bài test Holland
          </ButtonLink>
        </div>
      </Container>
    );
  }

  const radarData = holland.radarValues.map((r) => ({
    code: r.code,
    label: getRiasecType(r.code).labelVi,
    value: r.value,
  }));

  return (
    <Container className="py-10 sm:py-14">
      <Link
        href="/#roadmap"
        className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline dark:text-cyan-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Về trang chủ
      </Link>

      <div className="mt-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-cyan-300">
          Lộ trình cá nhân · RIASEC
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
          Lộ trình nghề nghiệp của bạn
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-white/65">
          Dựa trên mã Holland <strong className="text-slate-900 dark:text-white">{holland.hollandCode}</strong> từ
          bài test — không dùng dữ liệu giả.
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-violet-200/60 bg-white/90 p-6 dark:border-violet-500/25 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-fuchsia-300">
            Nhóm tính cách nổi bật
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {holland.topGroups.map((g, i) => (
              <span
                key={g.code}
                className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-900 dark:bg-violet-500/20 dark:text-violet-100"
              >
                #{i + 1} {g.code} · {g.labelVi} ({g.score} điểm)
              </span>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <HollandRadarChart data={radarData} size={280} />
          </div>
        </div>

        <div className="space-y-4">
          {profile.targetCareer ? (
            <div className="overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 to-white p-5 dark:border-cyan-500/25 dark:from-cyan-500/[0.08] dark:to-[#0a0b14]">
              {hasCareerImage(profile.targetCareer.id) ? (
                <CareerImage
                  careerId={profile.targetCareer.id}
                  alt={profile.targetCareer.name}
                  className="mb-4 shadow-md"
                  sizes="(max-width: 768px) 100vw, 480px"
                />
              ) : null}
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-3 py-1 text-xs font-medium dark:border-cyan-400/25 dark:bg-white/10">
                <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-300" />
                Nghề gợi ý hàng đầu
              </div>
              <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {profile.targetCareer.name}
              </h2>
              <ButtonLink
                href={`/library?riasec=${holland.topGroups[0]?.code ?? "I"}`}
                variant="secondary"
                size="sm"
                className="mt-4"
              >
                <BookOpen className="h-4 w-4" />
                Xem trong thư viện
              </ButtonLink>
            </div>
          ) : null}

          {profile.skillsToDevelop && profile.skillsToDevelop.length > 0 ? (
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-white/90">
                Kỹ năng cần phát triển
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.skillsToDevelop.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-white/80"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <h2 className="text-center text-lg font-semibold text-slate-900 dark:text-white">
          Các bước lộ trình
        </h2>
        <div className="relative mt-6 space-y-3">
          {roadmap.length > 0 ? (
            roadmap.map((step, i) => (
              <div key={`${step.label}-${i}`} className="flex justify-center">
                <div
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 shadow-sm",
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
                          "text-xs leading-relaxed",
                          step.isGoal ? "text-white/85" : "text-slate-500 dark:text-white/55",
                        )}
                      >
                        {step.focus}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-slate-500 dark:text-white/55">
              Chưa có bước lộ trình — hãy làm lại bài test để tạo mới.
            </p>
          )}
        </div>
      </div>
    </Container>
  );
}
