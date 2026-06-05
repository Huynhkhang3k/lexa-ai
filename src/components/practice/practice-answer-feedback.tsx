"use client";

import { CheckCircle2, Lightbulb, XCircle } from "lucide-react";
import { getCorrectAnswerLabel } from "@/lib/practice-answer-label";
import type { PracticeQuestion } from "@/lib/practice-types";
import { PracticeRichText } from "./practice-rich-text";

type Props = {
  question: PracticeQuestion;
  correct: boolean;
};

export function PracticeAnswerFeedback({ question, correct }: Props) {
  const correctLabel = getCorrectAnswerLabel(question);

  return (
    <div
      className={[
        "mt-6 overflow-hidden rounded-2xl border-2",
        correct
          ? "border-emerald-400/60 bg-gradient-to-br from-emerald-50 to-teal-50/80 dark:border-emerald-500/40 dark:from-emerald-500/10 dark:to-teal-500/5"
          : "border-rose-400/50 bg-gradient-to-br from-rose-50 to-orange-50/60 dark:border-rose-500/35 dark:from-rose-500/10 dark:to-orange-500/5",
      ].join(" ")}
    >
      <div
        className={[
          "flex items-center gap-3 px-5 py-4",
          correct
            ? "bg-emerald-500/10 dark:bg-emerald-500/15"
            : "bg-rose-500/10 dark:bg-rose-500/15",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            correct
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              : "bg-rose-500 text-white shadow-lg shadow-rose-500/30",
          ].join(" ")}
        >
          {correct ? (
            <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
          ) : (
            <XCircle className="h-6 w-6" strokeWidth={2.5} />
          )}
        </div>
        <div>
          <div
            className={[
              "text-lg font-bold",
              correct
                ? "text-emerald-800 dark:text-emerald-300"
                : "text-rose-800 dark:text-rose-300",
            ].join(" ")}
          >
            {correct ? "Chính xác!" : "Chưa đúng"}
          </div>
          <p className="text-sm text-slate-600 dark:text-white/60">
            {correct ? "Bạn đã chọn đáp án đúng." : "Xem đáp án và cách giải bên dưới."}
          </p>
        </div>
      </div>

      {!correct && correctLabel ? (
        <div className="border-t border-rose-200/80 px-5 py-3 dark:border-rose-500/20">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Đáp án đúng
          </div>
          <div className="mt-1 inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {correctLabel}
          </div>
        </div>
      ) : null}

      <div className="border-t border-slate-200/80 px-5 py-4 dark:border-white/10">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
          <Lightbulb className="h-4 w-4" />
          Giải thích
        </div>
        <PracticeRichText text={question.explanation} variant="explanation" />
      </div>
    </div>
  );
}
