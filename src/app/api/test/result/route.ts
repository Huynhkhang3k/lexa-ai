import { NextResponse } from "next/server";
import { extractJson, generateText } from "@/lib/gemini";
import { ageGroupLabel, type AgeGroup } from "@/lib/test-questions";

export const runtime = "nodejs";

type Answer = {
  questionIndex: number;
  question: string;
  selectedLabel: string;
  customText?: string;
};

type Body = {
  history: Answer[];
  ageGroup?: AgeGroup;
};

type ResultPayload = {
  title: string;
  summary: string;
  strengths: string[];
  careers: { name: string; why: string; matchPercent: number }[];
  nextSteps: string[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const ageGroup = body.ageGroup ?? "thcs";
    const historyText = (body.history ?? [])
      .map(
        (h) =>
          `Câu ${h.questionIndex + 1}: ${h.question}\n→ ${h.selectedLabel}${h.customText ? ` | Tự viết: ${h.customText}` : ""}`,
      )
      .join("\n\n");

    const prompt = `Phân tích kết quả bài test định hướng nghề cho học sinh ${ageGroupLabel(ageGroup)} Việt Nam.

Toàn bộ câu hỏi & trả lời:
${historyText}

Trả về JSON thuần:
{
  "title": "tên hồ sơ (VD: Phân tích & Sáng tạo)",
  "summary": "2-3 câu tóm tắt",
  "strengths": ["điểm mạnh 1", "điểm mạnh 2", "điểm mạnh 3"],
  "careers": [
    { "name": "tên nghề tại VN", "why": "lý do phù hợp", "matchPercent": 85 }
  ],
  "nextSteps": ["bước 1", "bước 2", "bước 3"]
}

Gợi ý 3-5 nghề/nhóm ngành phù hợp độ tuổi ${ageGroupLabel(ageGroup)} và thị trường Việt Nam. matchPercent từ 60-95.`;

    const raw = await generateText(prompt, {
      model: "gemini-2.5-flash-lite",
      timeoutMs: 25000,
      maxRetries: 4,
      backoffMs: 650,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 1200,
        responseMimeType: "application/json",
      },
    });
    let data: ResultPayload;
    try {
      data = extractJson<ResultPayload>(raw);
    } catch {
      const raw2 = await generateText(
        `${prompt}\n\nNhắc lại: CHỈ trả JSON thuần, không thêm chữ nào khác.`,
        {
          model: "gemini-2.5-flash-lite",
          timeoutMs: 20000,
          maxRetries: 4,
          backoffMs: 700,
          generationConfig: { temperature: 0.2, maxOutputTokens: 900 },
        },
      );
      data = extractJson<ResultPayload>(raw2);
    }

    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
