"use client";

import * as React from "react";
import type { GradeLevelId } from "@/lib/grade-level";
import type {
  PracticeCount,
  PracticeQuestion,
  PracticeSessionMeta,
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

export function usePracticeStream() {
  const [sessionId, setSessionId] = React.useState("");
  const [questions, setQuestions] = React.useState<PracticeQuestion[]>([]);
  const [meta, setMeta] = React.useState<PracticeSessionMeta | null>(null);
  const [loadingStart, setLoadingStart] = React.useState(false);
  const [loadingNext, setLoadingNext] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const preloadedRef = React.useRef<PracticeQuestion | null>(null);
  const preloadingRef = React.useRef(false);
  const paramsRef = React.useRef<{
    grade: string;
    subject: string;
    difficulty: string;
    count: PracticeCount;
    gradeLevel: GradeLevelId;
  } | null>(null);

  const preload = React.useCallback(async (index: number, sid: string, topics: string[]) => {
    const p = paramsRef.current;
    if (!p || preloadingRef.current || index >= p.count) return;
    if (preloadedRef.current?.id === `q${index + 1}`) return;

    preloadingRef.current = true;
    try {
      const q = await fetchQuestion({
        ...p,
        sessionId: sid,
        questionIndex: index + 1,
        previousTopics: topics,
      });
      preloadedRef.current = q;
    } catch {
      /* preload thất bại — sẽ fetch khi cần */
    } finally {
      preloadingRef.current = false;
    }
  }, []);

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
      void preload(1, sid, [q1.topic]);
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

    if (preloadedRef.current) {
      const q = preloadedRef.current;
      preloadedRef.current = null;
      let topics: string[] = [];
      setQuestions((prev) => {
        topics = [...prev, q].map((x) => x.topic);
        return [...prev, q];
      });
      void preload(nextIdx + 1, sessionId, topics);
      return q;
    }

    setLoadingNext(true);
    try {
      const topics = questions.map((x) => x.topic);
      const q = await fetchQuestion({
        ...p,
        sessionId,
        questionIndex: nextIdx + 1,
        previousTopics: topics,
      });
      setQuestions((prev) => [...prev, q]);
      void preload(nextIdx + 1, sessionId, [...topics, q.topic]);
      return q;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tải câu tiếp theo");
      return null;
    } finally {
      setLoadingNext(false);
    }
  }

  React.useEffect(() => {
    if (questions.length === 0 || !sessionId) return;
    const last = questions[questions.length - 1]!;
    const idx = questions.length;
    const p = paramsRef.current;
    if (p && idx < p.count && !preloadedRef.current && !preloadingRef.current) {
      void preload(idx, sessionId, questions.map((q) => q.topic));
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
    reset,
    setError,
  };
}
