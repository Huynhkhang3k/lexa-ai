import { NextResponse } from "next/server";
import { applyAiRateLimit } from "@/lib/api-guard";
import { isValidGradeLevel, type GradeLevelId } from "@/lib/grade-level";
import {
  buildHollandResult,
  type HollandAnswer,
  type HollandResult,
} from "@/lib/holland-scoring";
import { toUserFacingError } from "@/lib/user-errors";

export const runtime = "nodejs";

type Body = {
  answers: HollandAnswer[];
  ageGroup?: GradeLevelId;
};

export async function POST(req: Request) {
  try {
    const limited = applyAiRateLimit(req, "test-r", 12);
    if (limited) return limited;

    const body = (await req.json()) as Body;
    const answers = body.answers ?? [];

    if (!answers.length) {
      return NextResponse.json({ error: "Chưa có câu trả lời" }, { status: 400 });
    }

    const ageGroup = isValidGradeLevel(body.ageGroup ?? null) ? body.ageGroup! : "thcs";
    const result: HollandResult = buildHollandResult(answers);

    return NextResponse.json({ ...result, ageGroup });
  } catch (e) {
    const msg = toUserFacingError(e instanceof Error ? e.message : "Lỗi không xác định");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
