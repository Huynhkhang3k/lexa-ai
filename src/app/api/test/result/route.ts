import { NextResponse } from "next/server";
import { extractJson, generateText } from "@/lib/gemini";
import { inferTraitsFromText, type AgeGroup } from "@/lib/test-questions";
import type { TraitId } from "@/lib/test-scoring";
import {
  addTraits,
  buildInsights,
  careerWhy,
  emptyTraitScores,
  scoreCareers,
  topTraits,
} from "@/lib/test-scoring";

export const runtime = "nodejs";

type Answer = {
  questionIndex: number;
  question: string;
  selectedLabel: string;
  customText?: string;
  traits?: TraitId[];
};

type Body = {
  history: Answer[];
  ageGroup?: AgeGroup;
};

type ResultPayload = {
  title: string;
  summary: string;
  strengths: string[];
  insights: string[];
  traitScores: Record<TraitId, number>;
  topTraits: TraitId[];
  careers: { id: string; name: string; why: string; matchPercent: number }[];
  nextSteps: string[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const history = body.history ?? [];

    const traitScores = emptyTraitScores();
    for (const h of history) {
      const traits =
        h.traits?.length
          ? h.traits
          : h.customText
            ? inferTraitsFromText(h.customText)
            : inferTraitsFromText(h.selectedLabel);
      addTraits(traitScores, traits, 1);
    }

    const scored = scoreCareers(traitScores);
    const tops = topTraits(traitScores, 3);
    const insights = buildInsights(traitScores);

    const careers = scored.map((c) => ({
      id: c.id,
      name: c.name,
      why: careerWhy(c.name, traitScores),
      matchPercent: c.matchPercent,
    }));

    const historyText = history
      .map(
        (h) =>
          `Câu ${h.questionIndex + 1}: ${h.question}\n→ ${h.selectedLabel}${h.customText ? ` | Tự viết: ${h.customText}` : ""}`,
      )
      .join("\n\n");

    const prompt = `Bạn là cố vấn hướng nghiệp cho học sinh Việt Nam.

Đã phân tích điểm số từ ${history.length} câu trả lời.
Top traits: ${tops.join(", ")}
Nghề đã xếp hạng: ${careers.map((c) => `${c.name} (${c.matchPercent}%)`).join(", ")}

Lịch sử:
${historyText}

Trả JSON (chỉ diễn giải, không đổi nghề):
{
  "title": "tên hồ sơ ngắn",
  "summary": "2 câu tóm tắt",
  "strengths": ["điểm mạnh 1", "điểm mạnh 2", "điểm mạnh 3"],
  "nextSteps": ["bước 1", "bước 2", "bước 3"]
}`;

    let narrative: { title?: string; summary?: string; strengths?: string[]; nextSteps?: string[] } = {};
    try {
      const raw = await generateText(prompt, {
        model: "gemini-2.5-flash-lite",
        timeoutMs: 25000,
        maxRetries: 3,
        backoffMs: 650,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
          responseMimeType: "application/json",
        },
      });
      narrative = extractJson(raw);
    } catch {
      narrative = {
        title: "Hồ sơ phát triển cá nhân",
        summary: insights.join(" "),
        strengths: insights.slice(0, 3),
        nextSteps: [
          "Chọn nghề mục tiêu từ gợi ý",
          "Xem lộ trình trên trang chủ LEXA",
          "Luyện tập kỹ năng qua module học tập",
        ],
      };
    }

    const data: ResultPayload = {
      title: narrative.title ?? "Kết quả đánh giá",
      summary: narrative.summary ?? insights.join(" "),
      strengths: narrative.strengths?.length ? narrative.strengths : insights,
      insights,
      traitScores,
      topTraits: tops,
      careers,
      nextSteps: narrative.nextSteps ?? [],
    };

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
