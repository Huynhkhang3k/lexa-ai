import { NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";
import {
  chatAssistantContext,
  type GradeLevelId,
  gradeLevelLabel,
  isValidGradeLevel,
} from "@/lib/grade-level";

export const runtime = "nodejs";

type Body = {
  messages: { role: "user" | "assistant"; content: string }[];
  gradeLevel?: GradeLevelId;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const gradeLevel = isValidGradeLevel(body.gradeLevel ?? null) ? body.gradeLevel! : "thcs";
    const levelContext = chatAssistantContext(gradeLevel);

    const system = `Bạn là LEXA AI — trợ lý học tập thông minh cho học sinh Việt Nam.

Người dùng hiện tại: học sinh khối ${gradeLevelLabel(gradeLevel)}.
${levelContext}

Vai trò: HỖ TRỢ HỌC TẬP — giải thích môn học, gợi ý ôn thi, hướng dẫn làm bài (gợi ý từng bước, không làm hộ), tư vấn định hướng nghề khi được hỏi.

Nguyên tắc:
- Trả lời tiếng Việt, thân thiện, đúng trình độ khối ${gradeLevelLabel(gradeLevel)}
- Chia bước rõ ràng; khuyến khích tư duy thay vì chỉ đưa đáp án
- Không bịa điểm chuẩn hay chính sách tuyển sinh cụ thể
- Không nội dung độc hại hoặc gian lận thi cử`;

    const history = (body.messages ?? [])
      .slice(-14)
      .map((m) => `${m.role === "user" ? "Học sinh" : "LEXA AI"}: ${m.content}`)
      .join("\n");

    const prompt = `${system}

Lịch sử hội thoại gần đây:
${history || "(Chưa có)"}

Hãy trả lời tin nhắn MỚI NHẤT của học sinh một cách hữu ích nhất.`;

    const maxTokens = gradeLevel === "thpt" ? 1100 : gradeLevel === "thcs" ? 850 : 650;

    const reply = await generateText(prompt, {
      model: "gemini-2.5-flash-lite",
      timeoutMs: 20000,
      maxRetries: 3,
      backoffMs: 300,
      generationConfig: { temperature: 0.55, maxOutputTokens: maxTokens },
    });
    return NextResponse.json({ reply: reply.trim() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi không xác định";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
