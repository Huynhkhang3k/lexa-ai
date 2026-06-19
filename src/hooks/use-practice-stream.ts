"use client";

import * as React from "react";
import type { GradeLevelId } from "@/lib/grade-level";
import type {
  PracticeCount,
  PracticeQuestion,
  PracticeSessionMeta,
  QuestionCategory,
  QuestionType,
} from "@/lib/practice-types";
import { timeLimitForCount } from "@/lib/practice-types";

type FetchParams = {
  grade: string;
  subject: string;
  difficulty: string;
  count: PracticeCount;
  gradeLevel: GradeLevelId;
  sessionId: string;
  questionIndex: number;
  previousTopics: string[];
  previousSkills: string[];
  previousTypes: QuestionType[];
  previousChapters: string[];
  previousCategories: QuestionCategory[];
};

async function fetchQuestion(params: FetchParams): Promise<PracticeQuestion> {
  const res = await fetch("/api/practice/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Không tạo được câu hỏi");
  return data.question as PracticeQuestion;
}

function historyFromQuestions(questions: PracticeQuestion[]) {
  return {
    previousTopics: questions.map((q) => q.curriculum?.topic ?? q.topic),
    previousSkills: questions.map((q) => q.curriculum?.skill ?? "").filter(Boolean),
    previousTypes: questions.map((q) => q.type),
    previousChapters: questions.map((q) => q.curriculum?.chapter ?? "").filter(Boolean),
    previousCategories: questions
      .map((q) => q.curriculum?.category)
      .filter(Boolean) as QuestionCategory[],
  };
}

function expectedId(index: number) {
  return `q${index + 1}`;
}

export function usePracticeStream() {
  const [sessionId, setSessionId] = React.useState("");
  const [questions, setQuestions] = React.useState<PracticeQuestion[]>([]);
  const [meta, setMeta] = React.useState<PracticeSessionMeta | null>(null);
  const [loadingStart, setLoadingStart] = React.useState(false);
  const [loadingNext, setLoadingNext] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const questionsRef = React.useRef<PracticeQuestion[]>([]);
  questionsRef.current = questions;

  const preloadedRef = React.useRef<PracticeQuestion | null>(null);
  const preloadingRef = React.useRef(false);
  const paramsRef = React.useRef<{
    grade: string;
    subject: string;
    difficulty: string;
    count: PracticeCount;
    gradeLevel: GradeLevelId;
  } | null>(null);

  const preload = React.useCallback(
    async (index: number, sid: string, prevQuestions: PracticeQuestion[]) => {
      const p = paramsRef.current;
      if (!p || preloadingRef.current || index >= p.count) return;
      if (prevQuestions[index]) return;
      if (preloadedRef.current?.id === expectedId(index)) return;

      preloadingRef.current = true;
      try {
        const hist = historyFromQuestions(prevQuestions);
        const q = await fetchQuestion({
          ...p,
          sessionId: sid,
          questionIndex: index + 1,
          ...hist,
        });
        if (q.id === expectedId(index)) {
          preloadedRef.current = q;
        }
      } catch {
        /* preload thất bại — fetch khi bấm Tiếp theo */
      } finally {
        preloadingRef.current = false;
      }
    },
    [],
  );

  async function start(params: {
    grade: string;
    subject: string;
    difficulty: string;
    count: PracticeCount;
    gradeLevel: GradeLevelId;
  }) {
    setLoadingStart(true);
    setError(null);
    setQuestions([]);
    preloadedRef.current = null;

    const sid = `ps-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setSessionId(sid);
    paramsRef.current = params;

    try {
      const q1 = await fetchQuestion({
        ...params,
        sessionId: sid,
        questionIndex: 1,
        previousTopics: [],
        previousSkills: [],
        previousTypes: [],
        previousChapters: [],
        previousCategories: [],
      });

      const sessionMeta: PracticeSessionMeta = {
        sessionId: sid,
        grade: params.grade,
        subject: params.subject,
        difficulty: params.difficulty,
        count: params.count,
        timeLimitSec: timeLimitForCount(params.count),
      };

      setMeta(sessionMeta);
      setQuestions([q1]);
      void preload(1, sid, [q1]);
      return q1;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi mạng");
      throw e;
    } finally {
      setLoadingStart(false);
    }
  }

  async function ensureNextQuestion(currentIndex: number): Promise<PracticeQuestion | null> {
    const p = paramsRef.current;
    if (!p) return null;
    const nextIdx = currentIndex + 1;
    if (nextIdx >= p.count) return null;

    const existing = questionsRef.current[nextIdx];
    if (existing) return existing;

    const cached = preloadedRef.current;
    if (cached?.id === expectedId(nextIdx)) {
      preloadedRef.current = null;
      setQuestions((prev) => {
        const next = [...prev, cached];
        void preload(nextIdx + 1, sessionId, next);
        return next;
      });
      return cached;
    }
    preloadedRef.current = null;

    setLoadingNext(true);
    setError(null);
    try {
      const prev = questionsRef.current;
      const hist = historyFromQuestions(prev);
      const q = await fetchQuestion({
        ...p,
        sessionId,
        questionIndex: nextIdx + 1,
        ...hist,
      });
      setQuestions((prevQs) => {
        if (prevQs[nextIdx]) return prevQs;
        const next = [...prevQs, q];
        void preload(nextIdx + 1, sessionId, next);
        return next;
      });
      return q;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải câu tiếp theo");
      return null;
    } finally {
      setLoadingNext(false);
    }
  }

  const kickPreload = React.useCallback(
    (currentIndex: number, prevQuestions: PracticeQuestion[]) => {
      const p = paramsRef.current;
      if (!p || !sessionId) return;
      const nextIdx = currentIndex + 1;
      if (nextIdx >= p.count) return;
      if (prevQuestions[nextIdx]) return;
      void preload(nextIdx, sessionId, prevQuestions);
    },
    [sessionId, preload],
  );

  React.useEffect(() => {
    if (questions.length === 0 || !sessionId) return;
    const idx = questions.length;
    const p = paramsRef.current;
    if (p && idx < p.count && !preloadedRef.current && !preloadingRef.current) {
      void preload(idx, sessionId, questions);
    }
  }, [questions, sessionId, preload]);

  function reset() {
    setQuestions([]);
    setMeta(null);
    setSessionId("");
    setError(null);
    preloadedRef.current = null;
    paramsRef.current = null;
  }

  return {
    sessionId,
    questions,
    meta,
    loadingStart,
    loadingNext,
    error,
    start,
    ensureNextQuestion,
    kickPreload,
    reset,
    setError,
  };
}
