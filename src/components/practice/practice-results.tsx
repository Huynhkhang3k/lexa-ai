"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/practice-analysis";
import type { PracticeSessionResult } from "@/lib/practice-types";

type Props = {
  result: PracticeSessionResult;
  grade: string;
  subject: string;
  difficulty: string;
  onRetry: () => void;
};

export function PracticeResults({
  result,
  grade,
  subject,
  difficulty,
  onRetry,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-violet-500">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            Hoàn thành bài luyện tập
          </div>
          <p className="text-sm text-slate-600 dark:text-white/60">
            {grade} · {subject} · {difficulty}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Điểm số", value: `${result.scorePercent}%` },
              { label: "Đúng", value: String(result.correct) },
              { label: "Sai", value: String(result.wrong) },
              { label: "Thời gian", value: formatDuration(result.durationMs) },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-white/10 dark:bg-white/5"
              >
                <div className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="text-center text-3xl font-bold text-sky-700 dark:text-cyan-300">
            {result.accuracy}% chính xác
          </div>

          <ResultSection title="Điểm mạnh" items={result.strengths} tone="emerald" />
          <ResultSection title="Điểm yếu" items={result.weaknesses} tone="amber" />
          <ResultSection title="Chủ đề cần ôn tập" items={result.topicsReview} tone="sky" />
          <ResultSection title="Kiến thức cần học lại" items={result.knowledgeGaps} tone="violet" />

          <Button size="lg" className="w-full justify-center" onClick={onRetry}>
            Luyện tập lại
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "emerald" | "amber" | "sky" | "violet";
}) {
  if (items.length === 0) return null;
  const colors = {
    emerald: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5",
    amber: "border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5",
    sky: "border-sky-200 bg-sky-50/50 dark:border-cyan-500/20 dark:bg-cyan-500/5",
    violet: "border-violet-200 bg-violet-50/50 dark:border-violet-500/20 dark:bg-violet-500/5",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[tone]}`}>
      <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
      <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-white/70">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
