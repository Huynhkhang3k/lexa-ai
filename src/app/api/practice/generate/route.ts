import { NextResponse } from "next/server";
import { applyAiRateLimit } from "@/lib/api-guard";
import { extractJson, generateText } from "@/lib/gemini";
import {
  practiceDifficultyContext,
  type GradeLevelId,
  isValidGradeLevel,
} from "@/lib/grade-level";
import {
  buildSingleQuestionPrompt,
  getSuggestedTypeForIndex,
  normalizeSingleQuestion,
  type PracticeQuestionRaw,
} from "@/lib/practice-generate";
import { PRACTICE_COUNTS } from "@/lib/practice-types";
import { toUserFacingError } from "@/lib/user-errors";

export const runtime = "nodejs";
export const maxDuration = 30;

type Body = {
  grade: string;
  subject: string;
  difficulty: string;
  count: number;
  gradeLevel?: GradeLevelId;
  sessionId?: string;
  questionIndex?: number;
  previousTopics?: string[];
};

type SinglePayload = {
  question?: PracticeQuestionRaw;
};

const JSON_OPTS = {
  model: "gemini-2.5-flash-lite" as const,
  timeoutMs: 25000,
  maxRetries: 2,
  backoffMs: 400,
  generationConfig: {
    temperature: 0.55,
    maxOutputTokens: 4096,
    responseMimeType: "application/json",
  },
};

async function generateOneQuestion(
  questionIndex: number,
  totalCount: number,
  selectedGrade: string,
  effectiveGrade: string,
  subject: string,
  difficulty: string,
  difficultyNote: string,
  previousTopics: string[],
) {
  const suggestedType = getSuggestedTypeForIndex(questionIndex - 1);
  const prompt = buildSingleQuestionPrompt(
    questionIndex,
    totalCount,
    selectedGrade,
    effectiveGrade,
    subject,
    difficulty,
    difficultyNote,
    suggestedType,
    previousTopics,
  );

  let lastError: Error | null = null;

  for (let i = 0; i < 2; i++) {
    try {
      const raw = await generateText(
        i === 0 ? prompt : `${prompt}\n\nNhắc lại: chỉ 1 câu trong "question". JSON hợp lệ.`,
        {
          ...JSON_OPTS,
          generationConfig: {
            ...JSON_OPTS.generationConfig,
            temperature: i === 0 ? 0.55 : 0.3,
          },
        },
      );
      const data = extractJson<SinglePayload>(raw);
      const normalized = normalizeSingleQuestion(data.question, questionIndex);
      if (normalized) return normalized;
      lastError = new Error("AI trả về câu hỏi không hợp lệ");
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }

  throw lastError ?? new Error("AI không tạo được câu hỏi");
}

export async function POST(req: Request) {
  try {
    const limited = applyAiRateLimit(req, "practice", 30);
    if (limited) return limited;

    const body = (await req.json()) as Body;
    const rawCount = body.count ?? 20;
    const totalCount = PRACTICE_COUNTS.includes(rawCount as 20 | 30)
      ? rawCount
      : rawCount >= 30
        ? 30
        : 20;

    const questionIndex = Math.min(
      Math.max(body.questionIndex ?? 1, 1),
      totalCount,
    );

    const gradeLevel = isValidGradeLevel(body.gradeLevel ?? null) ? body.gradeLevel! : "thcs";
    const { effectiveGrade, difficultyNote } = practiceDifficultyContext(
      gradeLevel,
      body.grade,
      body.difficulty,
    );

    const previousTopics = Array.isArray(body.previousTopics)
      ? body.previousTopics.filter((t) => typeof t === "string").slice(-8)
      : [];

    const question = await generateOneQuestion(
      questionIndex,
      totalCount,
      body.grade,
      effectiveGrade,
      body.subject,
      body.difficulty,
      difficultyNote,
      previousTopics,
    );

    const sessionId =
      body.sessionId ?? `ps-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json({
      sessionId,
      question,
      meta: {
        grade: body.grade,
        effectiveGrade,
        subject: body.subject,
        difficulty: body.difficulty,
        gradeLevel,
        count: totalCount,
        questionIndex,
        timeLimitSec: totalCount === 30 ? 1800 : 1200,
      },
    });
  } catch (e) {
    const msg = toUserFacingError(e instanceof Error ? e.message : "Lỗi không xác định");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
