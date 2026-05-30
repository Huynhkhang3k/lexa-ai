import * as React from "react";
import { ArrowRight, Briefcase, Sparkles, Target, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { DEMO_PROFILE } from "@/lib/landing-data";

export function PersonalProfileSection() {
  const p = DEMO_PROFILE;

  return (
    <section>
      <SectionHeading
        eyebrow="Cá nhân hoá"
        title="Hồ sơ phát triển cá nhân"
        description="LEXA không đưa cùng một nội dung cho mọi người — mỗi học sinh có hồ sơ riêng, cập nhật theo hành trình thực tế."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[280px_1fr]">
        <Card className="overflow-hidden border-sky-200/60 dark:border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-2xl font-bold text-white shadow-md">
              {p.avatarInitials}
            </div>
            <div className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              {p.name}
            </div>
            <div className="text-sm text-slate-500 dark:text-white/55">{p.grade}</div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/50">
                <span>Tiến độ hồ sơ</span>
                <span className="font-semibold text-sky-700 dark:text-cyan-300">
                  {p.progress}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-600"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>
            <ButtonLink href="/test" size="sm" className="mt-5 w-full justify-center">
              Tạo hồ sơ của bạn
            </ButtonLink>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <User className="h-4 w-4 text-sky-600 dark:text-cyan-300" />
              LEXA hiểu Minh An như thế nào
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
            <ProfileBlock
              icon={Sparkles}
              title="Điểm mạnh"
              items={p.strengths}
              variant="sky"
            />
            <ProfileBlock
              icon={Briefcase}
              title="Ngành phù hợp"
              highlight={p.matchedCareer}
            />
            <ProfileBlock
              icon={Target}
              title="Kỹ năng cần phát triển"
              items={p.skillsToDevelop}
              variant="violet"
            />
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04] sm:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
                Mục tiêu nghề nghiệp
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-white/80">
                {p.careerGoal}
              </p>
              <ButtonLink
                href="/library"
                variant="ghost"
                size="sm"
                className="mt-3 px-0 text-sky-700 dark:text-cyan-300"
              >
                Xem lộ trình chi tiết <ArrowRight className="h-3.5 w-3.5" />
              </ButtonLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function ProfileBlock({
  icon: Icon,
  title,
  items,
  highlight,
  variant = "sky",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items?: string[];
  highlight?: string;
  variant?: "sky" | "violet";
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">
        <Icon
          className={
            variant === "violet"
              ? "h-3.5 w-3.5 text-violet-600 dark:text-fuchsia-300"
              : "h-3.5 w-3.5 text-sky-600 dark:text-cyan-300"
          }
        />
        {title}
      </div>
      {highlight ? (
        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{highlight}</p>
      ) : null}
      {items ? (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li
              key={item}
              className="text-sm text-slate-700 dark:text-white/75 before:mr-2 before:text-sky-500 before:content-['•']"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
