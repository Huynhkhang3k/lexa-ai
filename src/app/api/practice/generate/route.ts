import { NextResponse } from "next/server";
import { extractJson, generateText } from "@/lib/gemini";
import {
  practiceDifficultyContext,
  type GradeLevelId,
  isValidGradeLevel,
} from "@/lib/grade-level";

export const runtime = "nodejs";

type Body = {
  grade: string;
  subject: string;
  difficulty: string;
  count: number;
  gradeLevel?: GradeLevelId;
};

type PracticePayload = {
  questions: {
    id: string;
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
};

const JSON_OPTS = {
  model: "gemini-2.5-flash-lite" as const,
  timeoutMs: 45000,
  maxRetries: 4,
  backoffMs: 500,
  generationConfig: {
    temperature: 0.5,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  },
};

function buildPrompt(
  count: number,
  selectedGrade: string,
  effectiveGrade: string,
  subject: string,
  difficulty: string,
  difficultyNote: string,
) {
  return `Tạo đúng ${count} câu hỏi trắc nghiệm THỬ THÁCH cho học sinh Việt Nam.
- Lớp người dùng chọn luyện: ${selectedGrade}
- Mức độ nội dung thực tế: ${effectiveGrade} (KHÓ HƠN lớp đã chọn)
- Môn: ${subject}
- Độ khó yêu cầu: ${difficulty}

${difficultyNote}

Yêu cầu bắt buộc:
- Câu hỏi phải THỰC SỰ KHÓ, không quá cơ bản hay lặp lại kiến thức quá dễ
- Ít nhất 60% câu yêu cầu suy luận nhiều bước hoặc vận dụng
- Mỗi câu 4 phương án, đúng chương trình phổ thông VN
- Các phương án sai phải hợp lý (nhiễu tốt), tránh đáp án quá hiển nhiên
- explanation tối đa 1 câu ngắn
- id: q1..q${count}, correctIndex: 0-3

Trả về JSON:
{
  "questions": [
    {
      "id": "q1",
      "prompt": "đề bài",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctIndex": 0,
      "explanation": "giải thích ngắn"
    }
  ]
}`;
}

async function generateBatch(
  count: number,
  selectedGrade: string,
  effectiveGrade: string,
  subject: string,
  difficulty: string,
  difficultyNote: string,
): Promise<PracticePayload["questions"]> {
  const prompt = buildPrompt(count, selectedGrade, effectiveGrade, subject, difficulty, difficultyNote);

  try {
    const raw = await generateText(prompt, JSON_OPTS);
    const data = extractJson<PracticePayload>(raw);
    if (data.questions?.length) return data.questions;
  } catch {
    // retry below
  }

  const raw2 = await generateText(
    `${prompt}\n\nCHỈ trả JSON thuần. Phải có đủ ${count} câu KHÓ trong mảng questions.`,
    {
      ...JSON_OPTS,
      generationConfig: { ...JSON_OPTS.generationConfig, temperature: 0.35 },
    },
  );
  const data = extractJson<PracticePayload>(raw2);
  if (!data.questions?.length) {
    throw new Error("AI không tạo được câu hỏi");
  }
  return data.questions;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const count = Math.min(Math.max(body.count ?? 10, 5), 15);
    const gradeLevel = isValidGradeLevel(body.gradeLevel ?? null) ? body.gradeLevel! : "thcs";
    const { effectiveGrade, difficultyNote } = practiceDifficultyContext(
      gradeLevel,
      body.grade,
      body.difficulty,
    );

    const batchSize = 5;
    const allQuestions: PracticePayload["questions"] = [];
    let remaining = count;
    let batchNum = 0;

    while (remaining > 0) {
      const batchCount = Math.min(remaining, batchSize);
      const batch = await generateBatch(
        batchCount,
        body.grade,
        effectiveGrade,
        body.subject,
        body.difficulty,
        difficultyNote,
      );
      const normalized = batch.slice(0, batchCount).map((q, i) => ({
        ...q,
        id: `q${allQuestions.length + i + 1}`,
        options: q.options.slice(0, 4),
        correctIndex: Math.min(Math.max(q.correctIndex ?? 0, 0), 3),
      }));
      allQuestions.push(...normalized);
      remaining -= batchCount;
      batchNum++;
      if (batchNum > 4) break;
    }

    if (!allQuestions.length) {
      throw new Error("AI không tạo được câu hỏi");
    }

    return NextResponse.json({
      questions: allQuestions.slice(0, count),
      meta: {
        grade: body.grade,
        effectiveGrade,
        subject: body.subject,
        difficulty: body.difficulty,
        gradeLevel,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
