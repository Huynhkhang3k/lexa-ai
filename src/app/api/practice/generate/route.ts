import { NextResponse } from "next/server";
import { applyAiRateLimit } from "@/lib/api-guard";
import { extractJson, generateText } from "@/lib/gemini";
import {
  practiceDifficultyContext,
  type GradeLevelId,
  isValidGradeLevel,
  parseGradeNumber,
} from "@/lib/grade-level";
import {
  buildSingleQuestionPrompt,
  getGradeNumFromLabel,
  normalizeSingleQuestion,
  type PracticeQuestionRaw,
} from "@/lib/practice-generate";
import { PRACTICE_COUNTS, type QuestionType } from "@/lib/practice-types";
import {
  pickCurriculumSlot,
  type SessionHistory,
} from "@/lib/practice-session-planner";
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
  previousSkills?: string[];
  previousTypes?: string[];
  previousChapters?: string[];
  previousCategories?: string[];
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

function buildHistory(body: Body): SessionHistory {
  return {
    topics: Array.isArray(body.previousTopics)
      ? body.previousTopics.filter((t) => typeof t === "string")
      : [],
    skills: Array.isArray(body.previousSkills)
      ? body.previousSkills.filter((t) => typeof t === "string")
      : [],
    questionTypes: Array.isArray(body.previousTypes)
      ? (body.previousTypes.filter((t) => typeof t === "string") as QuestionType[])
      : [],
    chapters: Array.isArray(body.previousChapters)
      ? body.previousChapters.filter((t) => typeof t === "string")
      : [],
    categories: Array.isArray(body.previousCategories)
      ? (body.previousCategories.filter((c) =>
          ["theory", "calculation", "geometry", "real_world"].includes(String(c)),
        ) as SessionHistory["categories"])
      : [],
  };
}

async function generateOneQuestion(
  questionIndex: number,
  totalCount: number,
  selectedGrade: string,
  subject: string,
  difficulty: string,
  difficultyNote: string,
  history: SessionHistory,
) {
  const gradeNum = parseGradeNumber(selectedGrade) ?? getGradeNumFromLabel(selectedGrade);
  const slot = pickCurriculumSlot(
    selectedGrade,
    gradeNum,
    questionIndex,
    totalCount,
    history,
  );

  let lastReject: string | undefined;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const prompt = buildSingleQuestionPrompt(
      questionIndex,
      totalCount,
      selectedGrade,
      subject,
      difficulty,
      difficultyNote,
      slot,
      lastReject,
    );

    try {
      const raw = await generateText(
        attempt === 0
          ? prompt
          : `${prompt}\n\nSinh lại. JSON hợp lệ. Tuân thủ slot chương trình.`,
        {
          ...JSON_OPTS,
          generationConfig: {
            ...JSON_OPTS.generationConfig,
            temperature: attempt === 0 ? 0.55 : 0.35,
          },
        },
      );
      const data = extractJson<SinglePayload>(raw);
      const normalized = normalizeSingleQuestion(data.question, {
        slot,
        questionIndex,
      });
      if (normalized) return normalized;
      lastReject = "Câu hỏi không hợp lệ hoặc vượt cấp / sai chương trình";
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      lastReject = lastError.message;
    }
  }

  throw lastError ?? new Error(lastReject ?? "AI không tạo được câu hỏi");
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

    const history = buildHistory(body);

    const question = await generateOneQuestion(
      questionIndex,
      totalCount,
      body.grade,
      body.subject,
      body.difficulty,
      difficultyNote,
      history,
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
        curriculum: question.curriculum,
      },
    });
  } catch (e) {
    const msg = toUserFacingError(e instanceof Error ? e.message : "Lỗi không xác định");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
