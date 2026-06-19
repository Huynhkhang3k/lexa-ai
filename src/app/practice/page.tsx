"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PracticeResults } from "@/components/practice/practice-results";
import { PracticeSession } from "@/components/practice/practice-session";
import { PracticeSetup } from "@/components/practice/practice-setup";
import { useGradeLevel } from "@/context/grade-level-context";
import { usePracticeStream } from "@/hooks/use-practice-stream";
import { analyzePracticeSession } from "@/lib/practice-analysis";
import { recordActivity } from "@/lib/user-activity";
import { appendPracticeRecord } from "@/lib/user-history";
import type {
  PracticeAnswer,
  PracticeCount,
  PracticeQuestion,
  PracticeSessionResult,
} from "@/lib/practice-types";

type Difficulty = "Dễ" | "Trung bình" | "Khó";
type Phase = "setup" | "loading" | "session" | "results";

export default function PracticePage() {
  const { gradeLevel } = useGradeLevel();
  const stream = usePracticeStream();

  const [phase, setPhase] = React.useState<Phase>("setup");
  const [grade, setGrade] = React.useState("Lớp 10");
  const [subject, setSubject] = React.useState("Toán");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("Trung bình");
  const [count, setCount] = React.useState<PracticeCount>(20);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, PracticeAnswer>>({});
  const [timeLeftSec, setTimeLeftSec] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [result, setResult] = React.useState<PracticeSessionResult | null>(null);

  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = React.useRef(false);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startTimer(sec: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeftSec(sec);
    timerRef.current = setInterval(() => {
      setTimeLeftSec((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function finishSession(
    qs: PracticeQuestion[],
    ans: Record<string, PracticeAnswer>,
    startMs: number,
  ) {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const durationMs = Date.now() - startMs;
    const expectedTotal = stream.meta?.count ?? count;
    const analysis = analyzePracticeSession(qs, ans, durationMs, expectedTotal);
    setResult(analysis);
    setPhase("results");

    const scoreStr = `${analysis.correctAnswers}/${analysis.totalQuestions}`;
    recordActivity("practice", { grade, subject, difficulty, score: scoreStr });
    const record = {
      sessionId: stream.sessionId || `ps-${Date.now()}`,
      grade,
      subject,
      difficulty,
      count: stream.meta?.count ?? expectedTotal,
      totalQuestions: analysis.totalQuestions,
      correctAnswers: analysis.correctAnswers,
      wrongAnswers: analysis.wrongAnswers,
      unansweredQuestions: analysis.unansweredQuestions,
      finalScore: analysis.finalScore,
      correct: analysis.correctAnswers,
      total: analysis.totalQuestions,
      wrong: analysis.wrongAnswers,
      score: scoreStr,
      accuracy: analysis.finalScore,
      durationMs: analysis.durationMs,
      topicsStrong: analysis.strengths,
      topicsWeak: analysis.weaknesses,
      topicsReview: analysis.topicsReview,
      knowledgeGaps: analysis.knowledgeGaps,
    };
    appendPracticeRecord(record);
    void fetch("/api/practice/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
  }

  async function startPractice() {
    setPhase("loading");
    stream.setError(null);
    try {
      await stream.start({
        grade,
        subject,
        difficulty,
        count,
        gradeLevel: gradeLevel ?? "thcs",
      });

      finishedRef.current = false;
      setCurrentIndex(0);
      setAnswers({});
      const now = Date.now();
      setStartedAt(now);
      startTimer(stream.meta?.timeLimitSec ?? (count === 30 ? 1800 : 1200));
      setPhase("session");
      recordActivity("practice", { grade, subject, difficulty });
    } catch {
      setPhase("setup");
    }
  }

  function handleTimeUp() {
    if (startedAt) finishSession(stream.questions, answers, startedAt);
  }

  React.useEffect(() => {
    if (phase === "session" && timeLeftSec === 0 && startedAt) {
      handleTimeUp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftSec, phase]);

  async function handleNext() {
    const total = stream.meta?.count ?? count;
    if (currentIndex + 1 >= total) {
      if (startedAt) finishSession(stream.questions, answers, startedAt);
      return;
    }

    if (stream.questions[currentIndex + 1]) {
      stream.setError(null);
      setCurrentIndex((i) => i + 1);
      return;
    }

    const q = await stream.ensureNextQuestion(currentIndex);
    if (q) {
      setCurrentIndex((i) => i + 1);
    }
  }

  async function retryNext() {
    stream.setError(null);
    await handleNext();
  }

  function resetAll() {
    if (timerRef.current) clearInterval(timerRef.current);
    stream.reset();
    setPhase("setup");
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setStartedAt(null);
  }

  const totalCount = stream.meta?.count ?? count;
  const currentQuestion = stream.questions[currentIndex];

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60">
          Luyện tập · LEXA AI
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Luyện tập theo lớp & môn học
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
          Bắt đầu trong vài giây · Đúng chương trình từng lớp · GeoGebra · preload thông minh.
        </p>

        <div className="mt-8">
          {phase === "setup" ? (
            <PracticeSetup
              grade={grade}
              subject={subject}
              difficulty={difficulty}
              count={count}
              loading={stream.loadingStart}
              error={stream.error}
              onGrade={setGrade}
              onSubject={setSubject}
              onDifficulty={setDifficulty}
              onCount={setCount}
              onStart={startPractice}
            />
          ) : null}

          {phase === "loading" ? (
            <div className="mt-6 flex flex-col items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              Đang tạo Câu 1…
            </div>
          ) : null}

          {phase === "session" && currentQuestion ? (
            <PracticeSession
              question={currentQuestion}
              currentIndex={currentIndex}
              totalCount={totalCount}
              answer={answers[currentQuestion.id]}
              timeLeftSec={timeLeftSec}
              loadingNext={stream.loadingNext}
              nextError={stream.error}
              onAnswer={(id, a) => setAnswers((prev) => ({ ...prev, [id]: a }))}
              onAfterSubmit={() =>
                stream.kickPreload(currentIndex, stream.questions)
              }
              onNext={() => void handleNext()}
              onRetryNext={() => void retryNext()}
              onTimeUp={handleTimeUp}
            />
          ) : null}

          {phase === "session" && !currentQuestion ? (
            <div className="mt-6 flex flex-col items-center gap-3 text-sm text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              Đang tải câu hỏi…
              {stream.error ? (
                <p className="text-rose-600">{stream.error}</p>
              ) : null}
            </div>
          ) : null}

          {phase === "results" && result ? (
            <PracticeResults
              result={result}
              grade={grade}
              subject={subject}
              difficulty={difficulty}
              onRetry={resetAll}
            />
          ) : null}
        </div>
      </div>
    </Container>
  );
}
