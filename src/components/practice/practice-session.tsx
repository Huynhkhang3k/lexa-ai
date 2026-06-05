"use client";

import * as React from "react";
import { Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatTimer } from "@/lib/practice-analysis";
import { hasAnswer } from "@/lib/practice-helpers";
import { isAnswerCorrect } from "@/lib/practice-scoring";
import type { PracticeAnswer, PracticeQuestion } from "@/lib/practice-types";
import { PracticeAnswerFeedback } from "./practice-answer-feedback";
import { QuestionRenderer } from "./question-renderer";

type Props = {
  question: PracticeQuestion;
  currentIndex: number;
  totalCount: number;
  answer: PracticeAnswer | undefined;
  timeLeftSec: number;
  loadingNext?: boolean;
  onAnswer: (id: string, answer: PracticeAnswer) => void;
  onNext: () => void;
  onTimeUp: () => void;
};

export function PracticeSession({
  question,
  currentIndex,
  totalCount,
  answer,
  timeLeftSec,
  loadingNext,
  onAnswer,
  onNext,
}: Props) {
  const [revealed, setRevealed] = React.useState(false);
  const progress = ((currentIndex + (revealed ? 1 : 0)) / totalCount) * 100;
  const correct = revealed && isAnswerCorrect(question, answer);

  React.useEffect(() => {
    setRevealed(false);
  }, [question.id]);

  function submitAnswer() {
    if (!hasAnswer(question, answer)) return;
    setRevealed(true);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="text-sm font-semibold text-slate-700 dark:text-white/80">
          Câu {currentIndex + 1} / {totalCount}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-mono font-semibold text-slate-900 dark:border-white/10 dark:bg-black/30 dark:text-white">
          <Clock className="h-4 w-4 text-sky-600" />
          {formatTimer(timeLeftSec)}
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-500/20 dark:text-violet-300">
              {question.topic}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-white/60">
              {question.type.replace(/_/g, " ")}
            </span>
          </div>

          <QuestionRenderer
            question={question}
            answer={answer}
            onChange={(a) => onAnswer(question.id, a)}
            disabled={revealed}
            revealed={revealed}
          />

          {revealed ? (
            <PracticeAnswerFeedback question={question} correct={!!correct} />
          ) : null}

          <div className="mt-6 flex justify-end">
            {!revealed ? (
              <Button
                size="lg"
                disabled={!hasAnswer(question, answer)}
                onClick={submitAnswer}
              >
                Trả lời
              </Button>
            ) : (
              <Button size="lg" disabled={loadingNext} onClick={onNext}>
                {loadingNext ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
                  </>
                ) : currentIndex + 1 >= totalCount ? (
                  "Xem kết quả"
                ) : (
                  "Tiếp theo"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
