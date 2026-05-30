import { NextResponse } from "next/server";
import { extractJson, generateText } from "@/lib/gemini";

export const runtime = "nodejs";

type Body = { word: string; context?: string };

type DictionaryResponse = {
  word: string;
  ipa: string;
  phonetic: string;
  syllables: string[];
  partOfSpeech: string;
  meaning: string;
  american: { label: "US"; phoneticHint: string };
  british: { label: "UK"; phoneticHint: string };
  synonyms: string[];
  antonyms: string[];
  examples: string[];
  collocations: string[];
  idioms: string[];
  phrasalVerbs: string[];
  formality: "very_casual" | "casual" | "neutral" | "formal" | "very_formal";
  frequency: "rare" | "uncommon" | "common" | "very_common";
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  usageNotes: string[];
  nativeNotes: string[];
};

const cache = new Map<string, { t: number; data: DictionaryResponse }>();
const CACHE_TTL_MS = 1000 * 60 * 30;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const word = (body.word ?? "").trim();
    if (!word) return NextResponse.json({ error: "Thiếu word" }, { status: 400 });

    const cacheKey = `${word.toLowerCase()}|${(body.context ?? "").slice(0, 120)}`;
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.t < CACHE_TTL_MS) {
      return NextResponse.json(hit.data);
    }

    const prompt = `You are an advanced English dictionary for Vietnamese students.
Provide pronunciation (IPA), meanings, examples, collocations, idioms, phrasal verbs, formality, frequency, CEFR difficulty.
If context is provided, prioritize the meaning that matches context.

Word: ${word}
Context: ${body.context ?? "(none)"}

Return strict JSON only with these keys:
${JSON.stringify(
      {
        word: "string",
        ipa: "string",
        phonetic: "string",
        syllables: ["string"],
        partOfSpeech: "string",
        meaning: "string",
        american: { label: "US", phoneticHint: "string" },
        british: { label: "UK", phoneticHint: "string" },
        synonyms: ["string"],
        antonyms: ["string"],
        examples: ["string"],
        collocations: ["string"],
        idioms: ["string"],
        phrasalVerbs: ["string"],
        formality: "neutral",
        frequency: "common",
        difficulty: "B1",
        usageNotes: ["string"],
        nativeNotes: ["string"],
      },
      null,
      2,
    )}`;

    const raw = await generateText(prompt, {
      model: "gemini-2.5-flash-lite",
      timeoutMs: 20000,
      maxRetries: 4,
      backoffMs: 650,
      generationConfig: { temperature: 0.25, maxOutputTokens: 1500 },
    });

    let json: DictionaryResponse;
    try {
      json = extractJson<DictionaryResponse>(raw);
    } catch {
      const raw2 = await generateText(
        `${prompt}\n\nReturn JSON only. No extra text.`,
        {
          model: "gemini-2.5-flash-lite",
          timeoutMs: 20000,
          maxRetries: 4,
          backoffMs: 700,
          generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
        },
      );
      json = extractJson<DictionaryResponse>(raw2);
    }

    cache.set(cacheKey, { t: Date.now(), data: json });
    return NextResponse.json(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

