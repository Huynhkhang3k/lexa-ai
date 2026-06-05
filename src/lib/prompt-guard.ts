const INJECTION_PATTERNS = [
  /bỏ qua (hướng dẫn|chỉ thị|quy tắc)/i,
  /ignore (previous|all|prior) (instructions?|prompts?)/i,
  /system prompt/i,
  /you are now/i,
  /pretend (you|to) (are|be)/i,
  /jailbreak/i,
  /dan mode/i,
];

const MAX_MESSAGE_LEN = 4000;

export function sanitizeUserMessages(messages: { role: string; content: string }[]) {
  return messages.map((m) => {
    if (m.role !== "user") return m;
    let content = m.content.slice(0, MAX_MESSAGE_LEN);
    for (const re of INJECTION_PATTERNS) {
      if (re.test(content)) {
        content =
          "[Tin nhắn đã được lọc] Hãy hỏi về bài học, ôn thi hoặc định hướng nghề — LEXA chỉ hỗ trợ học tập.";
        break;
      }
    }
    return { ...m, content };
  });
}

export function isBlockedContent(text: string): boolean {
  const t = text.toLowerCase();
  if (t.length > MAX_MESSAGE_LEN) return true;
  return INJECTION_PATTERNS.some((re) => re.test(text));
}
