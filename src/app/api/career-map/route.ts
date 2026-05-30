import { NextResponse } from "next/server";
import { extractJson, generateText } from "@/lib/gemini";
import {
  gradeLevelLabel,
  gradeLevelPromptContext,
  type GradeLevelId,
  isValidGradeLevel,
} from "@/lib/grade-level";
import type { FeatureSnapshot, ActivityFeature } from "@/lib/user-activity";

export const runtime = "nodejs";

type Body = {
  featuresUsed: ActivityFeature[];
  snapshots: FeatureSnapshot;
  gradeLevel?: GradeLevelId;
};

type MapPayload = {
  traits: string;
  style: string;
  goal: string;
};

const MIN_WORDS = 5;
const MAX_WORDS = 8;

const JSON_OPTS = {
  model: "gemini-2.5-flash-lite" as const,
  timeoutMs: 28000,
  maxRetries: 3,
  backoffMs: 600,
  generationConfig: {
    temperature: 0.45,
    maxOutputTokens: 180,
    responseMimeType: "application/json",
  },
};

function formatSnapshots(snapshots: FeatureSnapshot): string {
  const parts: string[] = [];

  if (snapshots.test) {
    const t = snapshots.test;
    let block = `BÀI TEST:
- Hồ sơ: ${t.title}
- Tóm tắt: ${t.summary}
- Điểm mạnh: ${t.strengths.join("; ")}
- Nghề gợi ý: ${t.careers.join("; ")}`;
    if (t.nextSteps?.length) block += `\n- Bước tiếp: ${t.nextSteps.join("; ")}`;
    if (t.answers?.length) {
      block += `\n- Câu trả lời:\n${t.answers
        .slice(0, 8)
        .map((a) => `  · ${a.question} → ${a.answer}`)
        .join("\n")}`;
    }
    parts.push(block);
  }

  if (snapshots.translate) {
    parts.push(`DỊCH THUẬT (${snapshots.translate.mode}):
"${snapshots.translate.lastInput}" → "${snapshots.translate.lastOutput}"`);
  }

  if (snapshots.chat?.recentQuestions.length) {
    parts.push(`TRỢ LÝ HỌC:\n${snapshots.chat.recentQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`);
  }

  if (snapshots.practice) {
    const p = snapshots.practice;
    parts.push(
      `LUYỆN TẬP: ${p.grade}, ${p.subject}, ${p.difficulty}${p.score ? `, điểm ${p.score}` : ""}`,
    );
  }

  return parts.join("\n\n") || "Chưa có dữ liệu.";
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimWords(text: string, max = MAX_WORDS): string {
  return text
    .trim()
    .replace(/\s*[·•|/]\s*/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .join(" ");
}

function normalizeField(text: string): string {
  const cleaned = trimWords(text.replace(/["""'']/g, "").trim());
  if (cleaned.length <= 42) return cleaned;
  return cleaned.slice(0, 42).replace(/\s+\S*$/, "").trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const gradeLevel = isValidGradeLevel(body.gradeLevel ?? null) ? body.gradeLevel! : "thcs";

    if ((body.featuresUsed?.length ?? 0) < 2) {
      return NextResponse.json(
        { error: "Cần dùng ít nhất 2 tính năng trước khi phân tích" },
        { status: 400 },
      );
    }

    const prompt = `Phân tích đặc điểm RIÊNG của học sinh ${gradeLevelPromptContext(gradeLevel)} — CHỈ dựa trên dữ liệu hoạt động thật bên dưới, KHÔNG dùng mẫu có sẵn.

Đã dùng: ${body.featuresUsed.join(", ")}

${formatSnapshots(body.snapshots ?? {})}

Quy tắc bắt buộc:
1. Suy luận nội bộ từ câu trả lời test, câu hỏi chat, môn luyện tập, nội dung dịch — mỗi người phải ra kết quả KHÁC nhau.
2. Cấm dùng cụm chung chung/sẵn có: "Logic · Sáng tạo", "Thực hành · Dự án", "Đại học / Cao đẳng", "Kiên nhẫn · Tập trung"…
3. Mỗi trường CHỈ MỘT cụm ngắn, đúng ${MIN_WORDS}-${MAX_WORDS} chữ (từ), không dấu ·, không liệt kê.
4. Phải lộ đặc điểm cụ thể từ dữ liệu (môn học, hành vi, sở thích thật).

Ví dụ đúng (minh hoạ cách viết — KHÔNG copy y nguyên):
- traits: "Thích môn Toán lý thuyết"
- style: "Hay hỏi trợ lý Vật lý"
- goal: "Ngành kỹ thuật phù hợp"

JSON:
{ "traits": "...", "style": "...", "goal": "..." }`;

    const raw = await generateText(prompt, JSON_OPTS);
    const data = extractJson<MapPayload>(raw);

    const traits = normalizeField(data.traits ?? "");
    const style = normalizeField(data.style ?? "");
    const goal = normalizeField(data.goal ?? "");

    if (!traits || !style || !goal) {
      throw new Error("AI không tạo được bản đồ nghề nghiệp");
    }

    for (const [label, val] of [
      ["traits", traits],
      ["style", style],
      ["goal", goal],
    ] as const) {
      const n = countWords(val);
      if (n < 3 || n > MAX_WORDS) {
        throw new Error(`Trường ${label} không đúng độ dài (${n} từ)`);
      }
    }

    return NextResponse.json({ traits, style, goal });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
