"use client";

import * as React from "react";
import { User } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "./section-heading";
import { getUserProfile, hasCompletedAssessment, type UserProfile } from "@/lib/user-profile";
import { getUserHistory, type UserHistory } from "@/lib/user-history";
import { TRAIT_LABELS } from "@/lib/test-scoring";
import type { TraitId } from "@/lib/test-scoring";
import { useSession } from "next-auth/react";

export function PersonalProfileSection() {
  const { data: session } = useSession();
  const [profile, setProfile] = React.useState<UserProfile>({});
  const [history, setHistory] = React.useState<UserHistory>({
    testAttempts: [],
    translateHistory: [],
    chatSessions: [],
    practiceHistory: [],
  });
  const [hasProfile, setHasProfile] = React.useState(false);

  React.useEffect(() => {
    const refresh = () => {
      setProfile(getUserProfile());
      setHistory(getUserHistory());
      setHasProfile(hasCompletedAssessment());
    };
    refresh();
    window.addEventListener("lexa-profile-updated", refresh);
    window.addEventListener("lexa-activity-updated", refresh);
    window.addEventListener("lexa-history-updated", refresh);
    return () => {
      window.removeEventListener("lexa-profile-updated", refresh);
      window.removeEventListener("lexa-activity-updated", refresh);
      window.removeEventListener("lexa-history-updated", refresh);
    };
  }, []);

  const displayName = session?.user?.name ?? profile.displayName ?? (hasProfile ? "Học sinh LEXA" : null);

  if (!hasProfile) {
    return (
      <section>
        <SectionHeading
          eyebrow="Cá nhân hoá"
          title="Hồ sơ phát triển cá nhân"
          description="Hoàn thành bài đánh giá — LEXA tạo hồ sơ riêng từ câu trả lời của bạn."
        />
        <Card className="mt-8 border-dashed border-slate-300 dark:border-white/15">
          <CardContent className="flex flex-col items-center p-8 text-center sm:p-10">
            <User className="h-10 w-10 text-slate-400 dark:text-white/40" />
            <p className="mt-4 max-w-md text-sm text-slate-600 dark:text-white/60">
              Chưa có hồ sơ. Làm bài test Holland RIASEC (18 câu) để LEXA phân tích và lưu kết quả
              {session ? " cho tài khoản của bạn" : " trên thiết bị này"}.
            </p>
            <ButtonLink href="/test" className="mt-6 justify-center">
              Bắt đầu đánh giá
            </ButtonLink>
          </CardContent>
        </Card>
      </section>
    );
  }

  const initials =
    displayName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "LX";

  return (
    <section id="profile">
      <SectionHeading
        eyebrow="Cá nhân hoá"
        title="Hồ sơ phát triển cá nhân"
        description="Dữ liệu từ bài đánh giá và hoạt động thực tế trên LEXA."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-2xl font-bold text-white">
              {initials}
            </div>
            <div className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              {displayName}
            </div>
            {profile.targetCareer ? (
              <p className="mt-1 text-sm text-sky-700 dark:text-cyan-300">
                Mục tiêu: {profile.targetCareer.name}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
                Chưa chọn nghề mục tiêu
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <User className="h-4 w-4 text-sky-600 dark:text-cyan-300" />
              LEXA hiểu bạn qua đánh giá
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0 sm:grid-cols-2">
            {profile.topTraits?.length ? (
              <Block title="Xu hướng nổi bật">
                {profile.topTraits.map((t: TraitId) => (
                  <span
                    key={t}
                    className="mr-1.5 mt-1 inline-block rounded-lg bg-sky-50 px-2 py-1 text-xs font-medium dark:bg-cyan-400/10"
                  >
                            {TRAIT_LABELS[t] ?? t}
                  </span>
                ))}
              </Block>
            ) : null}
            {profile.strengths?.length ? (
              <Block title="Điểm mạnh">
                <ul className="mt-1 space-y-1 text-sm text-slate-700 dark:text-white/75">
                  {profile.strengths.slice(0, 4).map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </Block>
            ) : null}
            {profile.suggestedCareers?.[0] ? (
              <Block title="Nghề phù hợp nhất">
                <p className="mt-1 text-sm font-semibold">{profile.suggestedCareers[0].name}</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-white/60">
                  {profile.suggestedCareers[0].why}
                </p>
              </Block>
            ) : null}
            {profile.skillsToDevelop?.length ? (
              <Block title="Kỹ năng cần phát triển">
                <ul className="mt-1 space-y-1 text-sm">
                  {profile.skillsToDevelop.map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </Block>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Hoạt động đã lưu
            </div>
            <p className="text-xs text-slate-500 dark:text-white/50">
              Dữ liệu thật từ bài test, dịch thuật, chat và luyện tập — dùng để phân tích lộ trình.
            </p>
          </CardHeader>
          <CardContent className="grid gap-2 pt-0 sm:grid-cols-2">
            <Stat label="Lần làm test" value={history.testAttempts.length} />
            <Stat label="Lần dịch" value={history.translateHistory.length} />
            <Stat label="Cuộc chat" value={history.chatSessions.length} />
            <Stat label="Bài luyện tập" value={history.practiceHistory.length} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200/80 px-3 py-2 dark:border-white/10">
      <div className="text-xs text-slate-500 dark:text-white/50">{label}</div>
      <div className="text-lg font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/10">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
