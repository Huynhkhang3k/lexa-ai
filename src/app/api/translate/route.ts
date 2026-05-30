import { NextResponse } from "next/server";
import { extractJson, generateText } from "@/lib/gemini";

export const runtime = "nodejs";

type Body = {
  input: string;
  sourceLang?: "auto" | "en" | "vi";
  targetLang: "en" | "vi";
};

type TranslationResponse = {
  detectedLang: "en" | "vi";
  confidence: number; // 0..1
  tone: string;
  translations: { text: string; label: string }[];
  rewrite: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const input = (body.input ?? "").trim();
    if (!input) return NextResponse.json({ error: "Thiếu input" }, { status: 400 });

    const sourceLang = body.sourceLang ?? "auto";
    const targetLang = body.targetLang;

    const prompt = `You are a premium translation system like Google Translate + DeepL + Grammarly.
Task: Translate between English and Vietnamese with context, tone, idioms/slang, academic and casual writing.

Input text:
"""${input}"""

Source language: ${sourceLang}
Target language: ${targetLang}

Return strict JSON only:
{
  "detectedLang": "en|vi",
  "confidence": 0.0,
  "tone": "string",
  "translations": [
    { "text": "translation 1", "label": "Most natural" },
    { "text": "translation 2", "label": "More formal" },
    { "text": "translation 3", "label": "Casual/native" }
  ],
  "rewrite": "a native rewrite in the target language"
}`;

    const raw = await generateText(prompt, {
      model: "gemini-2.5-flash-lite",
      timeoutMs: 15000,
      maxRetries: 3,
      backoffMs: 250,
      generationConfig: { temperature: 0.25, maxOutputTokens: 900 },
    });

    const json = extractJson<TranslationResponse>(raw);
    return NextResponse.json(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

