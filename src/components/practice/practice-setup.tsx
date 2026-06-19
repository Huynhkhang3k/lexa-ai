"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRACTICE_COUNTS, type PracticeCount } from "@/lib/practice-types";

const GRADES = [
  "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12",
] as const;

type Difficulty = "Dễ" | "Trung bình" | "Khó";

type Props = {
  grade: string;
  subject: string;
  difficulty: Difficulty;
  count: PracticeCount;
  loading: boolean;
  error: string | null;
  onGrade: (v: string) => void;
  onSubject: (v: string) => void;
  onDifficulty: (v: Difficulty) => void;
  onCount: (v: PracticeCount) => void;
  onStart: () => void;
};

export function PracticeSetup({
  grade,
  subject,
  difficulty,
  count,
  loading,
  error,
  onGrade,
  onSubject,
  onDifficulty,
  onCount,
  onStart,
}: Props) {
  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            Thiết lập bài luyện tập
          </span>
          <Sparkles className="h-5 w-5 text-sky-600" />
        </CardHeader>
        <CardContent className="grid gap-4 pt-2">
          <label className="grid gap-1 text-sm">
            <span className="text-xs font-medium text-slate-500">Lớp</span>
            <select
              value={grade}
              onChange={(e) => onGrade(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 dark:border-white/15 dark:bg-black/30 dark:text-white"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-xs font-medium text-slate-500">Môn học</span>
            <select
              value={subject}
              onChange={(e) => onSubject(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 dark:border-white/15 dark:bg-black/30 dark:text-white"
            >
              {["Toán", "Vật lý", "Hoá học", "Sinh học", "Tiếng Anh", "Ngữ văn", "Lịch sử", "Địa lý"].map(
                (s) => <option key={s} value={s}>{s}</option>,
              )}
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-xs font-medium text-slate-500">Độ khó</span>
            <select
              value={difficulty}
              onChange={(e) => onDifficulty(e.target.value as Difficulty)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 dark:border-white/15 dark:bg-black/30 dark:text-white"
            >
              {(["Dễ", "Trung bình", "Khó"] as Difficulty[]).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-2">
            <span className="text-xs font-medium text-slate-500">Số câu hỏi</span>
            <div className="grid grid-cols-2 gap-3">
              {PRACTICE_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onCount(n)}
                  className={[
                    "rounded-xl border px-4 py-3 text-center text-sm font-medium transition",
                    count === n
                      ? "border-sky-400 bg-sky-50 text-sky-800 dark:border-cyan-400/50 dark:bg-cyan-400/10 dark:text-cyan-200"
                      : "border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-black/20 dark:text-white/80",
                  ].join(" ")}
                >
                  {n} câu
                  <div className="mt-0.5 text-xs font-normal text-slate-500">
                    {n === 20 ? "20 phút" : "30 phút"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : null}

          <Button size="lg" className="mt-2 justify-center" onClick={onStart} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo đề…
              </>
            ) : (
              "Bắt đầu luyện tập"
            )}
          </Button>

          <p className="text-center text-xs text-slate-500">
            Chương trình: 35% lý thuyết · 35% tính toán · 20% hình học · 10% thực tế
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
