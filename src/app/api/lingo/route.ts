import { NextResponse } from "next/server";
import { extractJson, generateText } from "@/lib/gemini";
import {
  englishLevelContext,
  type GradeLevelId,
  gradeLevelLabel,
  isValidGradeLevel,
} from "@/lib/grade-level";

export const runtime = "nodejs";

type Body = {
  input: string;
  mode: "translate" | "fix" | "improve";
  sourceLang?: "auto" | "en" | "vi";
  targetLang?: "en" | "vi";
  gradeLevel?: GradeLevelId;
};

type LingoResponse = {
  detectedLang?: "en" | "vi";
  confidence?: number;
  tone?: string;
  translations?: { text: string; label: string }[];
  corrected?: string;
  native?: string;
  issues?: { type: string; before: string; after: string; explanation: string; tip?: string }[];
  improved?: string;
  notes?: string[];
};

const JSON_OPTS = {
  model: "gemini-2.5-flash-lite" as const,
  timeoutMs: 20000,
  maxRetries: 4,
  backoffMs: 650,
  generationConfig: {
    temperature: 0.2,
    maxOutputTokens: 1200,
    responseMimeType: "application/json",
  },
};

function buildPrompt(
  input: string,
  mode: Body["mode"],
  sourceLang: string,
  targetLang: string,
  gradeLevel: GradeLevelId,
): string {
  const levelNote = `Người dùng: học sinh khối ${gradeLevelLabel(gradeLevel)}. ${englishLevelContext(gradeLevel)}`;

  if (mode === "translate") {
    return `Dịch văn bản EN↔VI cho học sinh Việt Nam.
${levelNote}
Input: """${input}"""
Nguồn: ${sourceLang} | Đích: ${targetLang}

Trả về JSON đúng schema:
{
  "detectedLang": "en hoặc vi",
  "confidence": 0.85,
  "tone": "formal/casual/academic/...",
  "translations": [
    { "text": "bản dịch tự nhiên nhất", "label": "Tự nhiên nhất" },
    { "text": "bản dịch trang trọng hơn", "label": "Trang trọng" },
    { "text": "bản dịch thân mật", "label": "Thân mật" }
  ],
  "native": "viết lại tự nhiên bằng ngôn ngữ đích"
}
Mỗi translations[].text phải có nội dung thật, không để trống.`;
  }

  if (mode === "fix") {
    return `Sửa lỗi ngữ pháp/chính tả cho học sinh Việt Nam.
${levelNote}
Input: """${input}"""

Trả về JSON đúng schema:
{
  "corrected": "câu đã sửa",
  "native": "bản tự nhiên hơn",
  "issues": [
    { "type": "Grammar", "before": "...", "after": "...", "explanation": "giải thích ngắn", "tip": "mẹo ngắn" }
  ]
}
issues tối đa 8 mục. corrected và native không được trống.`;
  }

  return `Cải thiện văn phong cho học sinh Việt Nam.
${levelNote}
Input: """${input}"""

Trả về JSON đúng schema:
{
  "improved": "phiên bản cải thiện",
  "notes": ["ghi chú ngắn 1", "ghi chú ngắn 2"]
}
improved không được trống. notes tối đa 5 mục.`;
}

function isValidResponse(mode: Body["mode"], json: LingoResponse): boolean {
  if (mode === "translate") {
    return Boolean(json.translations?.some((t) => t.text?.trim()));
  }
  if (mode === "fix") {
    return Boolean(json.corrected?.trim());
  }
  return Boolean(json.improved?.trim());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const input = (body.input ?? "").trim();
    if (!input) return NextResponse.json({ error: "Thiếu input" }, { status: 400 });

    const mode = body.mode;
    const sourceLang = body.sourceLang ?? "auto";
    const targetLang = body.targetLang ?? "vi";
    const gradeLevel = isValidGradeLevel(body.gradeLevel ?? null) ? body.gradeLevel! : "thcs";
    const prompt = buildPrompt(input, mode, sourceLang, targetLang, gradeLevel);

    let json: LingoResponse;
    try {
      const raw = await generateText(prompt, JSON_OPTS);
      json = extractJson<LingoResponse>(raw);
    } catch {
      const raw2 = await generateText(`${prompt}\n\nCHỈ trả JSON thuần, đủ các trường bắt buộc.`, {
        ...JSON_OPTS,
        generationConfig: { ...JSON_OPTS.generationConfig, temperature: 0.1 },
      });
      json = extractJson<LingoResponse>(raw2);
    }

    if (!isValidResponse(mode, json)) {
      throw new Error("AI không trả về kết quả dịch hợp lệ. Vui lòng thử lại.");
    }

    return NextResponse.json(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
