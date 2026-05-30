import { NextResponse } from "next/server";
import { extractJson, generateText } from "@/lib/gemini";
import {
  AI_QUESTION_COUNT,
  type AgeGroup,
  ageGroupPromptContext,
  SCHOOL_QUESTION_COUNT,
  TOTAL_QUESTIONS,
} from "@/lib/test-questions";
import type { TraitId } from "@/lib/test-scoring";

const VALID_TRAITS = new Set<TraitId>([
  "logic",
  "tech",
  "math",
  "creative",
  "art",
  "design",
  "communication",
  "leadership",
  "business",
  "social",
  "practical",
]);

function normalizeTraits(raw: unknown): TraitId[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((t): t is TraitId => typeof t === "string" && VALID_TRAITS.has(t as TraitId));
}
export const runtime = "nodejs";

type Answer = {
  questionIndex: number;
  question: string;
  selectedLabel: string;
  customText?: string;
};

type Body = {
  questionIndex: number;
  history: Answer[];
  ageGroup: AgeGroup;
};

type QuestionPayload = {
  question: string;
  options: { id: string; label: string }[];
};

const JSON_OPTS = {
  model: "gemini-2.5-flash-lite" as const,
  timeoutMs: 25000,
  maxRetries: 4,
  backoffMs: 600,
  generationConfig: {
    temperature: 0.35,
    maxOutputTokens: 600,
    responseMimeType: "application/json",
  },
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const index = body.questionIndex ?? 0;
    const ageGroup = body.ageGroup ?? "thcs";

    if (index < SCHOOL_QUESTION_COUNT || index >= TOTAL_QUESTIONS) {
      return NextResponse.json(
        {
          error: `questionIndex phải từ ${SCHOOL_QUESTION_COUNT} đến ${TOTAL_QUESTIONS - 1} (câu trường học do client xử lý)`,
        },
        { status: 400 },
      );
    }

    const aiIndex = index - SCHOOL_QUESTION_COUNT + 1;

    const historyText =
      body.history?.length > 0
        ? body.history
            .map(
              (h) =>
                `Câu ${h.questionIndex + 1}: ${h.question}\n→ Trả lời: ${h.selectedLabel}${h.customText ? ` (tự viết: ${h.customText})` : ""}`,
            )
            .join("\n\n")
        : "Chưa có câu trả lời trước.";

    const ageContext = ageGroupPromptContext(ageGroup);

    const prompt = `Bạn là trợ lý hướng nghiệp cho ${ageContext}
Nhiệm vụ: tạo CÂU HỎI TRẮC NGHIỆM số ${aiIndex}/${AI_QUESTION_COUNT} (câu ${index + 1}/${TOTAL_QUESTIONS} tổng) để giúp học sinh hiểu bản thân.

Ràng buộc bắt buộc:
- Dùng tiếng Việt phù hợp độ tuổi, không dùng từ quá khó nếu là tiểu học/THCS.
- Không hỏi trực tiếp "bạn muốn làm nghề gì?" nếu học sinh còn nhỏ.
- Ưu tiên: sở thích, điểm mạnh, cách học, môi trường làm việc, hoạt động yêu thích.
- Liên kết nhẹ với câu trước (đặc biệt 2 câu đầu về trường học).
- Đúng 4 lựa chọn A/B/C/D rõ ràng, gần gũi.
- Tránh câu hỏi nhạy cảm.

Lịch sử trả lời trước:
${historyText}

Trả về JSON:
{
  "question": "nội dung câu hỏi",
  "options": [
    { "id": "a", "label": "...", "traits": ["logic"] },
    { "id": "b", "label": "...", "traits": ["creative", "art"] },
    { "id": "c", "label": "...", "traits": ["communication"] },
    { "id": "d", "label": "...", "traits": ["tech", "logic"] }
  ]
}

Mỗi option phải có traits (1-2 từ): logic, tech, math, creative, art, design, communication, leadership, business, social, practical.`;

    let data: QuestionPayload;
    try {
      const raw = await generateText(prompt, JSON_OPTS);
      data = extractJson<QuestionPayload>(raw);
    } catch {
      const raw2 = await generateText(`${prompt}\n\nCHỈ trả JSON thuần.`, {
        ...JSON_OPTS,
        generationConfig: { ...JSON_OPTS.generationConfig, temperature: 0.2 },
      });
      data = extractJson<QuestionPayload>(raw2);
    }

    if (!data.question || !Array.isArray(data.options) || data.options.length < 4) {
      throw new Error("AI trả về câu hỏi không hợp lệ");
    }

    return NextResponse.json({
      questionIndex: index,
      total: TOTAL_QUESTIONS,
      question: data.question,
      options: data.options.slice(0, 4).map((o) => ({
        id: o.id,
        label: o.label,
        traits: normalizeTraits((o as { traits?: unknown }).traits),
      })),
    });  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
