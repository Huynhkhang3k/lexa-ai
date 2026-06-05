export const MAX_CHAT_MESSAGES = 20;
export const MAX_MESSAGE_CHARS = 4000;
export const MAX_TOTAL_CHARS = 16_000;

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function validateChatMessages(
  raw: unknown,
): { ok: true; messages: ChatMessage[] } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "Thiếu danh sách tin nhắn (messages)." };
  }

  if (raw.length > MAX_CHAT_MESSAGES) {
    return {
      ok: false,
      error: `Tối đa ${MAX_CHAT_MESSAGES} tin nhắn mỗi lần gửi.`,
    };
  }

  const messages: ChatMessage[] = [];
  let totalChars = 0;

  for (const item of raw) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Định dạng tin nhắn không hợp lệ." };
    }

    const role = (item as { role?: string }).role;
    const contentRaw = (item as { content?: unknown }).content;

    if (role !== "user" && role !== "assistant") {
      return { ok: false, error: "Vai trò tin nhắn phải là user hoặc assistant." };
    }

    if (typeof contentRaw !== "string") {
      return { ok: false, error: "Nội dung tin nhắn phải là chuỗi văn bản." };
    }

    const content = contentRaw.trim();
    if (!content) {
      return { ok: false, error: "Tin nhắn không được để trống." };
    }

    if (content.length > MAX_MESSAGE_CHARS) {
      return {
        ok: false,
        error: `Mỗi tin nhắn tối đa ${MAX_MESSAGE_CHARS} ký tự.`,
      };
    }

    totalChars += content.length;
    messages.push({ role, content });
  }

  if (!messages.some((m) => m.role === "user")) {
    return { ok: false, error: "Cần ít nhất một tin nhắn từ người dùng." };
  }

  if (totalChars > MAX_TOTAL_CHARS) {
    return {
      ok: false,
      error: `Tổng nội dung tối đa ${MAX_TOTAL_CHARS} ký tự mỗi lần gửi.`,
    };
  }

  return { ok: true, messages };
}
