"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, GraduationCap, Loader2 } from "lucide-react";
import { HollandRiasecSection } from "@/components/home/holland-riasec-section";
import { HollandResultView } from "@/components/holland/holland-result-view";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { useGradeLevel, gradeLevelLabel } from "@/context/grade-level-context";
import { useSession } from "next-auth/react";
import { recordActivity } from "@/lib/user-activity";
import { appendTestAttempt } from "@/lib/user-history";
import { toUserFacingError } from "@/lib/user-errors";
import { profileFromTestSnapshot, saveUserProfile } from "@/lib/user-profile";
import {
  HOLLAND_QUESTIONS,
  HOLLAND_QUESTION_COUNT,
  type HollandQuestion,
} from "@/lib/holland-questions";
import type { HollandAnswer, HollandResult } from "@/lib/holland-scoring";
import { getRiasecType } from "@/lib/holland-riasec";
import { cn } from "@/lib/utils";

export default function TestPage() {
  const { gradeLevel, ready, openPicker } = useGradeLevel();
  const { data: session } = useSession();
  const [testStarted, setTestStarted] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<HollandAnswer[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [loadingResult, setLoadingResult] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<HollandResult | null>(null);

  const done = step >= HOLLAND_QUESTION_COUNT;
  const current: HollandQuestion | undefined = HOLLAND_QUESTIONS[step];
  const progress = done ? 100 : Math.round(((step + 1) / HOLLAND_QUESTION_COUNT) * 100);

  React.useEffect(() => {
    if (!current || done) return;
    const prev = answers.find((a) => a.questionId === current.id);
    setSelected(new Set(prev?.selectedOptionIds ?? []));
  }, [step, current?.id, done, answers]);

  function toggleOption(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submitQuestion() {
    if (!current || !gradeLevel) return;
    if (selected.size === 0) {
      setError("Hãy chọn ít nhất một ý bạn cảm thấy đúng.");
      return;
    }

    setError(null);
    const entry: HollandAnswer = {
      questionId: current.id,
      selectedOptionIds: [...selected],
    };

    const nextAnswers = [...answers.filter((a) => a.questionId !== current.id), entry];
    setAnswers(nextAnswers);

    if (step + 1 >= HOLLAND_QUESTION_COUNT) {
      setStep(HOLLAND_QUESTION_COUNT);
      setLoadingResult(true);
      try {
        const res = await fetch("/api/test/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: nextAnswers, ageGroup: gradeLevel }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Không phân tích được");
        setResult(data as HollandResult);

        const snapshot = {
          title: data.title ?? `Mã Holland ${data.hollandCode}`,
          summary: data.summary ?? "",
          strengths: data.strengths ?? [],
          careers: (data.careers ?? []).map((c: { name: string }) => c.name),
          nextSteps: data.nextSteps ?? [],
          answers: nextAnswers.map((a) => {
            const q = HOLLAND_QUESTIONS.find((x) => x.id === a.questionId);
            const labels = q?.options
              .filter((o) => a.selectedOptionIds.includes(o.id))
              .map((o) => o.label)
              .join("; ");
            return { question: q?.title ?? a.questionId, answer: labels || "—" };
          }),
        };

        recordActivity("test", snapshot);
        profileFromTestSnapshot(snapshot, {
          traitScores: {
            logic: 0,
            tech: 0,
            math: 0,
            creative: 0,
            art: 0,
            design: 0,
            communication: 0,
            leadership: 0,
            business: 0,
            social: 0,
            practical: 0,
          },
          topTraits: [],
          insights: [
            data.summary,
            ...(data.topGroups ?? []).map(
              (g: { labelVi: string; code: string; score: number }) =>
                `${g.labelVi} (${g.code}): ${g.score} điểm`,
            ),
          ],
          suggestedCareers: (data.careers ?? []).map(
            (c: { id: string; name: string; matchPercent: number; why: string }) => ({
              id: c.id,
              name: c.name,
              matchPercent: c.matchPercent,
              why: c.why,
            }),
          ),
          gradeLevel,
          displayName: session?.user?.name ?? undefined,
        });
        saveUserProfile({
          skillsToDevelop: data.skillsToDevelop,
          hollandResult: {
            hollandCode: data.hollandCode,
            radarValues: data.radarValues ?? [],
            groups: (data.groups ?? []).map(
              (g: { code: string; labelVi: string; score: number; percent: number }) => ({
                code: g.code,
                labelVi: g.labelVi,
                score: g.score,
                percent: g.percent,
              }),
            ),
            topGroups: (data.topGroups ?? []).map(
              (g: { code: string; labelVi: string; score: number }) => ({
                code: g.code,
                labelVi: g.labelVi,
                score: g.score,
              }),
            ),
            completedAt: new Date().toISOString(),
          },
        });

        appendTestAttempt({
          gradeLevel,
          title: data.title ?? `Holland ${data.hollandCode}`,
          summary: data.summary ?? "",
          strengths: data.strengths ?? [],
          careers: (data.careers ?? []).map((c: { name: string }) => c.name),
          topTraits: [],
          insights:
            data.topGroups?.map(
              (g: { labelVi: string; score: number; code: string }) =>
                `${g.labelVi} (${g.code}): ${g.score}`,
            ) ?? [],
        });
      } catch (e) {
        setError(toUserFacingError(e instanceof Error ? e.message : "Lỗi phân tích"));
        setStep(HOLLAND_QUESTION_COUNT - 1);
      } finally {
        setLoadingResult(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    if (step === 0) {
      setTestStarted(false);
      return;
    }
    setError(null);
    setStep((s) => s - 1);
  }

  function reset() {
    setTestStarted(false);
    setStep(0);
    setAnswers([]);
    setSelected(new Set());
    setResult(null);
    setError(null);
  }

  if (!ready) {
    return (
      <Container className="flex min-h-[40vh] items-center justify-center py-14">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </Container>
    );
  }

  if (!gradeLevel) {
    return (
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200/80 bg-white/90 p-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
          <GraduationCap className="mx-auto h-10 w-10 text-sky-600 dark:text-cyan-300" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
            Chọn khối lớp để bắt đầu
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
            Bài test Holland RIASEC — 18 câu chuẩn, mỗi câu 6 lựa chọn, chọn nhiều đáp án.
          </p>
          <Button className="mt-6" onClick={() => openPicker()}>
            Chọn khối lớp
          </Button>
        </div>
      </Container>
    );
  }

  if (!testStarted && !result) {
    return (
      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60">
              {gradeLevelLabel(gradeLevel)}
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
              Trắc nghiệm hướng nghiệp Holland
            </h1>
          </div>
          <HollandRiasecSection variant="test-intro" onStartTest={() => setTestStarted(true)} />
          <p className="mt-6 text-center text-xs text-slate-500 dark:text-white/45">
            <ButtonLink href="/#phuong-phap-danh-gia" className="underline">
              Xem phương pháp đánh giá LEXA AI
            </ButtonLink>
          </p>
        </div>
      </Container>
    );
  }

  const groupType = current ? getRiasecType(current.group) : null;

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        {!result ? (
          <div className="mb-6 rounded-2xl border border-violet-200/60 bg-violet-50/50 px-4 py-2.5 text-xs text-violet-900 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-100">
            <strong>Holland RIASEC</strong> · Câu {Math.min(step + 1, HOLLAND_QUESTION_COUNT)}/{HOLLAND_QUESTION_COUNT} ·
            mỗi lựa chọn +1 điểm · {gradeLevelLabel(gradeLevel)}
          </div>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {!result ? (
              <>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Đánh giá định hướng RIASEC
                </h1>
                <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
                  Chọn tất cả ý phù hợp — không có đúng/sai tuyệt đối.
                </p>
              </>
            ) : (
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Kết quả Holland RIASEC
              </h1>
            )}
          </div>
          {!done && !result ? (
            <Button variant="secondary" onClick={reset}>
              Về phần giới thiệu
            </Button>
          ) : null}
        </div>

        {!result ? (
          <>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 via-emerald-500 to-violet-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-white/60">
              {done ? "Hoàn thành" : `Câu ${step + 1}/${HOLLAND_QUESTION_COUNT}`}
              {current && groupType ? ` · Nhóm ${groupType.labelVi} (${current.group})` : ""}
            </div>
          </>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <AnimatePresence mode="popLayout">
          {!done && current ? (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6"
            >
              <Card className="overflow-hidden">
                <CardHeader className={cn("border-b", groupType?.bg)}>
                  <div className={cn("text-xs font-bold uppercase tracking-wider", groupType?.color)}>
                    Câu {step + 1} · Nhóm {current.group} — {groupType?.labelVi}
                  </div>
                  <div className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{current.title}</div>
                  <p className="text-sm text-slate-600 dark:text-white/60">{current.subtitle}</p>
                </CardHeader>
                <CardContent className="grid gap-2 pt-4">
                  {current.options.map((opt) => {
                    const on = selected.has(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleOption(opt.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                          on
                            ? "border-sky-400 bg-sky-50 dark:border-cyan-400/50 dark:bg-cyan-400/10"
                            : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                            on
                              ? "border-sky-500 bg-sky-500 text-white"
                              : "border-slate-300 dark:border-white/25",
                          )}
                        >
                          {on ? <Check className="h-3.5 w-3.5" /> : null}
                        </span>
                        <span className="text-slate-800 dark:text-white/90">{opt.label}</span>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-between gap-3">
                <Button variant="secondary" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </Button>
                <Button onClick={submitQuestion} disabled={selected.size === 0}>
                  {step + 1 >= HOLLAND_QUESTION_COUNT ? "Xem kết quả Holland" : "Câu tiếp theo"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ) : null}

          {done && loadingResult ? (
            <div className="mt-12 flex flex-col items-center gap-3 text-slate-600 dark:text-white/60">
              <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
              <p className="text-sm">Đang tính mã Holland và phân tích RIASEC…</p>
            </div>
          ) : null}

          {done && result && !loadingResult ? (
            <HollandResultView result={result} onReset={reset} />
          ) : null}
        </AnimatePresence>
      </div>
    </Container>
  );
}
