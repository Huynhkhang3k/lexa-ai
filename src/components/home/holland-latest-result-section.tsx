"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HollandRadarChart } from "@/components/holland/holland-radar-chart";
import { SectionHeading } from "./section-heading";
import { getUserProfile, type UserProfile } from "@/lib/user-profile";
import { getRiasecType } from "@/lib/holland-riasec";

export function HollandLatestResultSection() {
  const [profile, setProfile] = React.useState<UserProfile>({});

  React.useEffect(() => {
    const refresh = () => setProfile(getUserProfile());
    refresh();
    window.addEventListener("lexa-profile-updated", refresh);
    return () => window.removeEventListener("lexa-profile-updated", refresh);
  }, []);

  const holland = profile.hollandResult;
  if (!holland?.hollandCode) return null;

  const radarData = holland.radarValues.map((r) => ({
    code: r.code,
    label: getRiasecType(r.code).labelVi,
    value: r.value,
  }));

  const completedLabel = holland.completedAt
    ? new Date(holland.completedAt).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <section id="ket-qua-holland" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Kết quả mới nhất"
        title="Biểu đồ RIASEC của bạn"
        description={
          completedLabel
            ? `Mã Holland ${holland.hollandCode} — cập nhật ${completedLabel}`
            : `Mã Holland ${holland.hollandCode} từ bài test gần nhất`
        }
        align="center"
      />

      <div className="mt-8 overflow-hidden rounded-3xl border border-violet-200/60 bg-white/90 shadow-sm backdrop-blur-xl dark:border-violet-500/25 dark:bg-white/[0.04]">
        <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8 lg:items-center">
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-fuchsia-300">
              Mã Holland
            </p>
            <p className="mt-2 text-4xl font-bold tracking-[0.15em] text-slate-900 dark:text-white sm:text-5xl">
              {holland.hollandCode}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              {holland.topGroups.map((g, i) => (
                <span
                  key={g.code}
                  className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-900 dark:bg-violet-500/20 dark:text-violet-100"
                >
                  #{i + 1} {g.code} · {g.labelVi} ({g.score})
                </span>
              ))}
            </div>
            <Link
              href="/test"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline dark:text-fuchsia-300"
            >
              Làm lại bài test
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <HollandRadarChart data={radarData} size={300} className="max-w-[340px]" />
        </div>
      </div>
    </section>
  );
}
