"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDuration, formatScorePercent } from "@/lib/practice-analysis";
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
  const r = result;

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
          <div className="text-center">
            <div className="text-4xl font-bold text-sky-700 dark:text-cyan-300">
              {r.correctAnswers}/{r.totalQuestions}
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/60">Điểm cuối cùng</p>
            <p className="mt-2 text-lg font-semibold text-slate-800 dark:text-white/90">
              Tỉ lệ đúng: {formatScorePercent(r.finalScore)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Đúng", value: String(r.correctAnswers), tone: "text-emerald-600" },
              { label: "Sai", value: String(r.wrongAnswers), tone: "text-rose-600" },
              { label: "Chưa làm", value: String(r.unansweredQuestions), tone: "text-amber-600" },
              {
                label: "Không đạt",
                value: String(r.notCorrect),
                tone: "text-slate-600 dark:text-white/70",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-white/10 dark:bg-white/5"
              >
                <div className={`text-lg font-bold ${s.tone}`}>{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70">
            <p>
              Đã trả lời {r.answeredQuestions}/{r.totalQuestions} câu · Thời gian{" "}
              {formatDuration(r.durationMs)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Câu chưa làm không được tính điểm (tính vào không đạt).
            </p>
          </div>

          <ResultSection title="Điểm mạnh" items={r.strengths} tone="emerald" />
          <ResultSection title="Điểm yếu" items={r.weaknesses} tone="amber" />
          <ResultSection title="Chủ đề cần ôn tập" items={r.topicsReview} tone="sky" />
          <ResultSection title="Kiến thức cần học lại" items={r.knowledgeGaps} tone="violet" />

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
