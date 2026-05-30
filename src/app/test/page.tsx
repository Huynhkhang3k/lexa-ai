"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGradeLevel, gradeLevelLabel } from "@/context/grade-level-context";
import { recordActivity } from "@/lib/user-activity";
import {
  getSchoolQuestion,
  TOTAL_QUESTIONS,
  SCHOOL_QUESTION_COUNT,
} from "@/lib/test-questions";

type Answer = {
  questionIndex: number;
  question: string;
  selectedId: string;
  selectedLabel: string;
  customText?: string;
};

type QuestionData = {
  question: string;
  options: { id: string; label: string }[];
};

type ResultData = {
  title: string;
  summary: string;
  strengths: string[];
  careers: { name: string; why: string; matchPercent: number }[];
  nextSteps: string[];
};

export default function TestPage() {
  const { gradeLevel, ready } = useGradeLevel();
  const [step, setStep] = React.useState(0);
  const [history, setHistory] = React.useState<Answer[]>([]);
  const [current, setCurrent] = React.useState<QuestionData | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [customText, setCustomText] = React.useState("");
  const [useCustom, setUseCustom] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingResult, setLoadingResult] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ResultData | null>(null);
  const [retryTick, setRetryTick] = React.useState(0);

  const done = step >= TOTAL_QUESTIONS;
  const progress = done ? 100 : Math.round(((step + 1) / TOTAL_QUESTIONS) * 100);

  React.useEffect(() => {
    if (!ready || !gradeLevel || done) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setSelectedId(null);
      setCustomText("");
      setUseCustom(false);

      if (step < SCHOOL_QUESTION_COUNT) {
        if (!cancelled) {
          setCurrent(getSchoolQuestion(step, gradeLevel!));
          setLoading(false);
        }
        return;
      }

      const hist = history;
      try {
        const res = await fetch("/api/test/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionIndex: step,
            ageGroup: gradeLevel,
            history: hist.map((h) => ({
              questionIndex: h.questionIndex,
              question: h.question,
              selectedLabel: h.selectedLabel,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Không tải được câu hỏi");
        if (!cancelled) {
          setCurrent({ question: data.question, options: data.options });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Lỗi mạng");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ready, gradeLevel, step, done, retryTick, history]);

  async function submitAnswer() {
    if (!current || !gradeLevel) return;
    let label = "";
    if (useCustom) {
      if (!customText.trim()) return;
      label = customText.trim();
    } else {
      if (!selectedId) return;
      const opt = current.options.find((o) => o.id === selectedId);
      if (!opt) return;
      label = opt.label;
    }

    const answer: Answer = {
      questionIndex: step,
      question: current.question,
      selectedId: useCustom ? "custom" : selectedId!,
      selectedLabel: useCustom ? customText.trim() : label,
      customText: useCustom ? customText.trim() : undefined,
    };

    const newHistory = [...history, answer];
    setHistory(newHistory);

    if (step + 1 >= TOTAL_QUESTIONS) {
      setStep(TOTAL_QUESTIONS);
      setLoadingResult(true);
      setError(null);
      try {
        const res = await fetch("/api/test/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ageGroup: gradeLevel,
            history: newHistory.map((h) => ({
              questionIndex: h.questionIndex,
              question: h.question,
              selectedLabel: h.customText
                ? `${h.selectedLabel} (tự viết: ${h.customText})`
                : h.selectedLabel,
            })),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Không phân tích được");
        setResult(data);
        recordActivity("test", {
          title: data.title ?? "",
          summary: data.summary ?? "",
          strengths: data.strengths ?? [],
          careers: (data.careers ?? []).map((c: { name: string }) => c.name),
          nextSteps: data.nextSteps ?? [],
          answers: newHistory.map((h) => ({
            question: h.question,
            answer: h.customText
              ? `${h.selectedLabel} (tự viết: ${h.customText})`
              : h.selectedLabel,
          })),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Lỗi phân tích");
      } finally {
        setLoadingResult(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  }

  function reset() {
    setStep(0);
    setHistory([]);
    setCurrent(null);
    setResult(null);
    setError(null);
  }

  if (!ready || !gradeLevel) {
    return (
      <Container className="flex min-h-[40vh] items-center justify-center py-14">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60">
              AI Career Test · {TOTAL_QUESTIONS} câu · {gradeLevelLabel(gradeLevel)}
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Bài test định hướng nghề nghiệp
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
              Câu hỏi được điều chỉnh theo khối {gradeLevelLabel(gradeLevel)} — gồm 2 câu về trường học và 8 câu AI khám phá bản thân.
            </p>
          </div>
          <Button variant="secondary" onClick={reset}>
            Làm lại
          </Button>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-white/60">
          {done ? "Hoàn thành" : `Câu ${Math.min(step + 1, TOTAL_QUESTIONS)}/${TOTAL_QUESTIONS}`} · {progress}%
          {step < SCHOOL_QUESTION_COUNT ? " · Câu về trường học" : " · Câu AI"}
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
            <Button variant="secondary" size="sm" className="mt-2" onClick={() => setRetryTick((t) => t + 1)}>
              Thử lại
            </Button>
          </div>
        ) : null}

        <AnimatePresence mode="popLayout">
          {!done && !loading && current ? (
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6"
            >
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="text-base font-semibold text-slate-900 dark:text-white">
                    {current.question}
                  </div>
                  <Sparkles className="h-5 w-5 shrink-0 text-violet-600 dark:text-fuchsia-300" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-3">
                    {current.options.map((o) => {
                      const selected = !useCustom && selectedId === o.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            setUseCustom(false);
                            setSelectedId(o.id);
                          }}
                          className={[
                            "w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                            selected
                              ? "border-sky-400 bg-sky-50 dark:border-cyan-400/50 dark:bg-cyan-400/10"
                              : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/6",
                          ].join(" ")}
                        >
                          <span className="font-medium text-slate-900 dark:text-white">
                            {o.label}
                          </span>
                        </button>
                      );
                    })}

                    {step >= SCHOOL_QUESTION_COUNT ? (
                      <div className="mt-2 rounded-2xl border border-dashed border-slate-300 p-4 dark:border-white/20">
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-white/80">
                          <input
                            type="checkbox"
                            checked={useCustom}
                            onChange={(e) => {
                              setUseCustom(e.target.checked);
                              if (e.target.checked) setSelectedId(null);
                            }}
                          />
                          Tự viết (chỉ khi không có đáp án phù hợp)
                        </label>
                        {useCustom ? (
                          <textarea
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="Mô tả ngắn câu trả lời của bạn…"
                            className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 dark:border-white/15 dark:bg-black/30 dark:text-white"
                            rows={3}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (step === 0) return;
                        setHistory((h) => h.slice(0, -1));
                        setStep((s) => s - 1);
                      }}
                      disabled={step === 0}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Quay lại
                    </Button>
                    <Button
                      onClick={submitAnswer}
                      disabled={useCustom ? !customText.trim() : !selectedId}
                    >
                      {step + 1 >= TOTAL_QUESTIONS ? "Xem kết quả" : "Tiếp theo"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}

          {loading && !done ? (
            <div className="mt-10 flex flex-col items-center gap-3 text-slate-600 dark:text-white/60">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <p className="text-sm">AI đang tạo câu hỏi {step + 1}…</p>
            </div>
          ) : null}

          {done && loadingResult ? (
            <div className="mt-10 flex flex-col items-center gap-3 text-slate-600 dark:text-white/60">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              <p className="text-sm">AI đang phân tích kết quả…</p>
            </div>
          ) : null}

          {done && result && !loadingResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <div className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 dark:bg-fuchsia-500/20 dark:text-fuchsia-200">
                    Kết quả AI
                  </div>
                  <div className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                    {result.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/60">
                    {result.summary}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Điểm mạnh
                    </div>
                    <ul className="mt-2 grid gap-1 text-sm text-slate-700 dark:text-white/80">
                      {result.strengths?.map((s) => (
                        <li key={s} className="flex gap-2">
                          <span className="text-sky-600">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Nghề gợi ý
                    </div>
                    <div className="mt-3 grid gap-3">
                      {result.careers?.map((c) => (
                        <div
                          key={c.name}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {c.name}
                            </div>
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800 dark:bg-cyan-400/20 dark:text-cyan-200">
                              {c.matchPercent}%
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
                            {c.why}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                      Bước tiếp theo
                    </div>
                    <ul className="mt-2 grid gap-1 text-sm text-slate-700 dark:text-white/80">
                      {result.nextSteps?.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <Button onClick={reset} size="lg" className="mt-2 w-full justify-center">
                    Làm lại bài test
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </Container>
  );
}
