"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGradeLevel } from "@/context/grade-level-context";
import { recordActivity } from "@/lib/user-activity";

const GRADES = [
  "Lớp 6",
  "Lớp 7",
  "Lớp 8",
  "Lớp 9",
  "Lớp 10",
  "Lớp 11",
  "Lớp 12",
] as const;

type Difficulty = "Dễ" | "Trung bình" | "Khó";

type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export default function PracticePage() {
  const { gradeLevel } = useGradeLevel();
  const [grade, setGrade] = React.useState<string>("Lớp 10");
  const [subject, setSubject] = React.useState("Toán");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("Trung bình");
  const [count, setCount] = React.useState(10);
  const [questions, setQuestions] = React.useState<Question[] | null>(null);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setAnswers({});
    try {
      const res = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, subject, difficulty, count, gradeLevel: gradeLevel ?? "thcs" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Không tạo được đề");
      setQuestions(data.questions);
      recordActivity("practice", { grade, subject, difficulty });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi mạng");
      setQuestions(null);
    } finally {
      setLoading(false);
    }
  }

  const score = React.useMemo(() => {
    if (!questions || !submitted) return null;
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctIndex) correct++;
    }
    return { correct, total: questions.length };
  }, [questions, answers, submitted]);

  React.useEffect(() => {
    if (!score || !questions) return;
    recordActivity("practice", {
      grade,
      subject,
      difficulty,
      score: `${score.correct}/${score.total}`,
    });
  }, [score, grade, subject, difficulty, questions]);

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60">
          Practice Generator · AI Gemini
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Luyện tập theo lớp & môn học
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
          Chọn lớp luyện tập — AI tạo đề khó hơn mức lớp đã chọn, phù hợp khối bạn đang học.
        </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Tuỳ chọn
              </span>
              <Sparkles className="h-5 w-5 text-sky-600" />
            </CardHeader>
            <CardContent className="grid gap-3 pt-2">
              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-slate-500">Lớp</span>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 dark:border-white/15 dark:bg-black/30 dark:text-white"
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-slate-500">Môn học</span>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 dark:border-white/15 dark:bg-black/30 dark:text-white"
                >
                  {["Toán", "Vật lý", "Hoá học", "Sinh học", "Tiếng Anh", "Ngữ văn", "Lịch sử", "Địa lý"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-slate-500">Độ khó</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 dark:border-white/15 dark:bg-black/30 dark:text-white"
                >
                  {(["Dễ", "Trung bình", "Khó"] as Difficulty[]).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-xs font-medium text-slate-500">Số câu (5–15)</span>
                <input
                  type="number"
                  min={5}
                  max={15}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 dark:border-white/15 dark:bg-black/30 dark:text-white"
                />
              </label>

              <Button
                size="lg"
                className="mt-2 justify-center"
                onClick={generate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo đề…
                  </>
                ) : (
                  "Tạo bộ câu hỏi AI"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Bài luyện tập
              </div>
              <p className="text-sm text-slate-600 dark:text-white/60">
                {questions
                  ? `${questions.length} câu · ${grade} · ${subject} · ${difficulty}`
                  : "Chưa có đề — bấm tạo bên trái."}
              </p>
            </CardHeader>
            <CardContent className="pt-2">
              {error ? (
                <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
              ) : null}

              {score ? (
                <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center dark:border-cyan-500/30 dark:bg-cyan-500/10">
                  <div className="text-2xl font-bold text-sky-800 dark:text-cyan-200">
                    {score.correct}/{score.total}
                  </div>
                  <div className="text-sm text-sky-700 dark:text-cyan-300/80">điểm đúng</div>
                </div>
              ) : null}

              {questions?.map((q, qi) => (
                <div
                  key={q.id}
                  className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Câu {qi + 1}. {q.prompt}
                  </div>
                  <div className="mt-3 grid gap-2">
                    {q.options.map((opt, idx) => {
                      const picked = answers[q.id] === idx;
                      const showResult = submitted;
                      const isCorrect = idx === q.correctIndex;
                      return (
                        <label
                          key={opt}
                          className={[
                            "flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm transition",
                            picked
                              ? "border-sky-400 bg-sky-50 dark:border-cyan-400/50 dark:bg-cyan-400/10"
                              : "border-slate-200 bg-white dark:border-white/10 dark:bg-black/20",
                            showResult && isCorrect
                              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                              : "",
                            showResult && picked && !isCorrect
                              ? "border-red-300 bg-red-50 dark:bg-red-500/10"
                              : "",
                          ].join(" ")}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={picked}
                            disabled={submitted}
                            onChange={() =>
                              setAnswers((a) => ({ ...a, [q.id]: idx }))
                            }
                          />
                          <span className="text-slate-800 dark:text-white/90">{opt}</span>
                          {showResult && isCorrect ? (
                            <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-600" />
                          ) : null}
                          {showResult && picked && !isCorrect ? (
                            <XCircle className="ml-auto h-4 w-4 text-red-500" />
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                  {submitted ? (
                    <p className="mt-2 text-xs text-slate-600 dark:text-white/55">
                      💡 {q.explanation}
                    </p>
                  ) : null}
                </div>
              ))}

              {questions && questions.length > 0 ? (
                <Button
                  className="w-full justify-center"
                  size="lg"
                  disabled={submitted || Object.keys(answers).length < questions.length}
                  onClick={() => setSubmitted(true)}
                >
                  Nộp bài & xem đáp án
                </Button>
              ) : !loading ? (
                <p className="text-sm text-slate-500">Chưa có câu hỏi.</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
