import { NextResponse } from "next/server";
import { applyAiRateLimit } from "@/lib/api-guard";
import { extractJson, generateText } from "@/lib/gemini";
import { gradeLevelLabel, gradeLevelPromptContext, isValidGradeLevel, type GradeLevelId } from "@/lib/grade-level";
import { buildRoadmap, type RoadmapStep } from "@/lib/roadmap";
import { careerNameById, resolveCareerId } from "@/lib/test-careers";
import { getCareerById } from "@/lib/careers";
import { toUserFacingError } from "@/lib/user-errors";
import type { TraitId } from "@/lib/test-scoring";
import { TRAIT_LABELS } from "@/lib/test-scoring";

export const runtime = "nodejs";

type Body = {
  careerId: string;
  careerName?: string;
  gradeLevel?: string;
  topTraits?: TraitId[];
  history?: { question: string; selectedLabel: string; customText?: string }[];
};

type AiRoadmap = { steps: { label: string; focus: string; isGoal?: boolean }[] };

function normalizeSteps(raw: AiRoadmap["steps"], careerName: string): RoadmapStep[] {
  const steps = raw
    .filter((s) => s?.label?.trim() && s?.focus?.trim())
    .slice(0, 10)
    .map((s) => ({
      label: s.label.trim(),
      focus: s.focus.trim(),
      isGoal: Boolean(s.isGoal),
    }));

  if (!steps.length) return [];

  const last = steps[steps.length - 1]!;
  if (!last.isGoal) {
    steps.push({ label: careerName, focus: "Mục tiêu nghề nghiệp bạn đã chọn", isGoal: true });
  } else {
    last.label = careerName;
  }

  return steps;
}

export async function POST(req: Request) {
  try {
    const limited = applyAiRateLimit(req, "roadmap", 12);
    if (limited) return limited;

    const body = (await req.json()) as Body;
    const gradeLevel: GradeLevelId = isValidGradeLevel(body.gradeLevel ?? null)
      ? (body.gradeLevel as GradeLevelId)
      : "thcs";
    const resolvedId = resolveCareerId(body.careerId, body.careerName) ?? body.careerId;
    const careerName =
      body.careerName?.trim() ||
      getCareerById(resolvedId)?.name ||
      careerNameById(resolvedId);

    const traitText =
      body.topTraits?.length
        ? body.topTraits.map((t) => TRAIT_LABELS[t]).join(", ")
        : "chưa có";

    const historyText =
      body.history?.length
        ? body.history
            .map(
              (h, i) =>
                `Câu ${i + 1}: ${h.question}\n→ ${h.selectedLabel}${h.customText ? ` (${h.customText})` : ""}`,
            )
            .join("\n\n")
        : "Chưa có chi tiết câu trả lời.";

    const careerInfo = getCareerById(resolvedId);
    const studyPath = careerInfo?.studyPath ?? "";
    const skills = careerInfo?.skills?.join(", ") ?? "";

    const prompt = `Bạn là cố vấn hướng nghiệp cho học sinh Việt Nam — ${gradeLevelPromptContext(gradeLevel)}.

Học sinh CHỌN nghề mục tiêu: **${careerName}** (id: ${resolvedId}).
Điểm nổi bật từ bài test: ${traitText}.
${studyPath ? `Lộ trình học tham khảo: ${studyPath}.` : ""}
${skills ? `Kỹ năng nghề: ${skills}.` : ""}

Câu trả lời bài test:
${historyText}

Tạo lộ trình phát triển CÁ NHÂN (6–8 bước) dựa trên câu trả lời thật — không dùng mẫu chung.
- Bước 1: xuất phát từ khối ${gradeLevelLabel(gradeLevel)} hiện tại
- Các bước giữa: kỹ năng/môn học/hoạt động cụ thể, liên quan câu trả lời và nghề ${careerName}
- Bước cuối: mục tiêu nghề (isGoal: true), label = "${careerName}"
- Tiếng Việt, dễ hiểu, mỗi bước 1 câu focus ngắn

JSON:
{
  "steps": [
    { "label": "...", "focus": "...", "isGoal": false },
    { "label": "${careerName}", "focus": "...", "isGoal": true }
  ]
}`;

    let roadmap: RoadmapStep[] = [];

    try {
      const raw = await generateText(prompt, {
        model: "gemini-2.5-flash-lite",
        timeoutMs: 28000,
        maxRetries: 3,
        backoffMs: 600,
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
        },
      });
      const data = extractJson<AiRoadmap>(raw);
      roadmap = normalizeSteps(data.steps ?? [], careerName);
    } catch {
      roadmap = [];
    }

    if (roadmap.length < 4) {
      roadmap = buildRoadmap(resolvedId, careerName, gradeLevel);
    }

    return NextResponse.json({
      careerId: resolvedId,
      careerName,
      roadmap,
    });
  } catch (e) {
    const msg = toUserFacingError(e instanceof Error ? e.message : "Lỗi không xác định");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
