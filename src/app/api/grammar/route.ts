import { NextResponse } from "next/server";
import { extractJson, generateText } from "@/lib/gemini";

export const runtime = "nodejs";

type Body = {
  input: string;
  lang?: "en" | "vi" | "auto";
};

type GrammarResponse = {
  corrected: string;
  native: string;
  issues: {
    type:
      | "grammar"
      | "spelling"
      | "punctuation"
      | "word_choice"
      | "capitalization"
      | "style";
    before: string;
    after: string;
    explanation: string;
    tip?: string;
  }[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const input = (body.input ?? "").trim();
    if (!input) return NextResponse.json({ error: "Thiếu input" }, { status: 400 });

    const prompt = `You are an AI grammar and spelling corrector for students.
Detect grammar, spelling, punctuation, unnatural wording, wrong vocabulary usage.
Explain simply so Vietnamese students can understand.

Language: ${body.lang ?? "auto"}
Input:
"""${input}"""

Return strict JSON only:
{
  "corrected": "string",
  "native": "native speaker version",
  "issues": [
    {
      "type": "grammar|spelling|punctuation|word_choice|capitalization|style",
      "before": "substring",
      "after": "substring",
      "explanation": "simple explanation",
      "tip": "optional short tip"
    }
  ]
}`;

    const raw = await generateText(prompt, {
      model: "gemini-2.5-flash-lite",
      timeoutMs: 15000,
      maxRetries: 3,
      backoffMs: 250,
      generationConfig: { temperature: 0.2, maxOutputTokens: 1100 },
    });

    const json = extractJson<GrammarResponse>(raw);
    return NextResponse.json(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

