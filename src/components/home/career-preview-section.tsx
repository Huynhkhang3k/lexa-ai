"use client";

import * as React from "react";
import {
  ArrowRight,
  BookOpen,
  Cpu,
  DollarSign,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { CareerImage } from "@/components/career/career-image";
import { CAREERS, getCareerById } from "@/lib/careers";
import { getCareerTechnologies } from "@/lib/career-tech";
import { getUserProfile, type UserProfile } from "@/lib/user-profile";

const INFO_ROWS = [
  { key: "description", label: "Mô tả", icon: BookOpen },
  { key: "averageSalary", label: "Mức lương tham khảo", icon: DollarSign },
  { key: "outlook", label: "Triển vọng nghề nghiệp", icon: TrendingUp, fromOpportunities: true },
  { key: "skills", label: "Kỹ năng cần thiết", icon: Wrench, isList: true },
  { key: "relatedSubjects", label: "Môn học liên quan", icon: GraduationCap, isList: true },
  { key: "studyPath", label: "Lộ trình học tập", icon: Sparkles },
  { key: "technologies", label: "Công nghệ thường dùng", icon: Cpu, isList: true },
] as const;

export function CareerPreviewSection() {
  const [profile, setProfile] = React.useState<UserProfile>({});

  React.useEffect(() => {
    const refresh = () => setProfile(getUserProfile());
    refresh();
    window.addEventListener("lexa-profile-updated", refresh);
    return () => window.removeEventListener("lexa-profile-updated", refresh);
  }, []);

  const careerId =
    profile.targetCareer?.id ??
    profile.suggestedCareers?.[0]?.id ??
    "ai-eng";

  const base = getCareerById(careerId) ?? CAREERS[0];
  const career = base
    ? {
        ...base,
        technologies: getCareerTechnologies(base.id, base.skills),
        outlook: base.opportunities.join(" · "),
      }
    : null;

  if (!career) return null;

  const subtitle = profile.targetCareer
    ? "Nghề mục tiêu bạn đã chọn — thông tin chi tiết từ thư viện LEXA."
    : profile.suggestedCareers?.[0]
      ? "Preview nghề phù hợp nhất từ kết quả đánh giá của bạn."
      : "Xem trước cấu trúc thông tin mỗi nghề trong thư viện LEXA.";

  return (
    <section id="careers">
      <SectionHeading
        eyebrow="Thư viện nghề nghiệp"
        title="Mỗi nghề — một bức tranh đầy đủ"
        description={subtitle}
      />

      <Card className="mt-8 overflow-hidden border-slate-200/80 dark:border-white/10">
        {career.imageUrl ? (
          <CareerImage careerId={career.id} alt={career.name} className="rounded-none" />
        ) : null}
        <CardHeader className="border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-sky-50/50 pb-4 dark:border-white/10 dark:from-white/[0.04] dark:to-cyan-500/[0.06]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {career.name}
                </h3>
                {career.highlight ? (
                  <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-800 dark:bg-cyan-400/15 dark:text-cyan-200">
                    {career.highlight}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-white/60">{career.tagline}</p>
            </div>
            <ButtonLink href={`/library?career=${career.id}`} variant="secondary" size="sm">
              Xem 60+ nghề <ArrowRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {INFO_ROWS.map((row) => {
            let value: string | string[] | undefined;
            if ("fromOpportunities" in row && row.fromOpportunities) {
              value = career.outlook;
            } else if (row.key === "technologies") {
              value = career.technologies;
            } else {
              value = career[row.key as keyof typeof career] as string | string[];
            }
            const Icon = row.icon;
            return (
              <div
                key={row.key}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
                  <Icon className="h-3.5 w-3.5" />
                  {row.label}
                </div>
                {"isList" in row && row.isList && Array.isArray(value) ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {value.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-slate-200/80 bg-white px-2 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-white/75">
                    {value as string}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
