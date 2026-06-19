/** Loại bỏ suy nghĩ nội bộ / metadata AI khỏi giải thích hiển thị */
const AI_LEAK_RE =
  /matchRight|correctPairs|diagramData|initCommands|`\w+`|```|Cập nhật lại|Giả sử ta|Do đó, ta sẽ sửa|mâu thuẫn với|tuân thủ yêu cầu|JSON|questionIndex/i;

export function sanitizeExplanation(raw: string, maxLen = 480): string | null {
  let t = raw.trim();
  if (!t) return null;
  if (AI_LEAK_RE.test(t)) return null;
  if (t.length > 900) return null;

  t = t.replace(/```[\s\S]*?```/g, "");
  t = t.replace(/\*\*([^*]+)\*\*/g, "$1");
  t = t.replace(/\s+/g, " ").trim();

  if (t.length > maxLen) {
    const cut = t.slice(0, maxLen);
    const last = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("!"), cut.lastIndexOf("?"));
    t = last > 80 ? cut.slice(0, last + 1) : `${cut}…`;
  }

  return t.length >= 12 ? t : null;
}

export function fallbackExplanation(type: string): string {
  switch (type) {
    case "fill_sign":
      return "Thay các giá trị vào biểu thức, tính kết quả rồi so sánh với số cho trong đề để chọn dấu <, > hoặc =.";
    case "fill_number":
      return "Áp dụng công thức trong đề, thay số và tính cẩn thận từng bước.";
    case "true_false":
      return "Kiểm tra mệnh đề bằng lý thuyết đã học hoặc phản ví dụ.";
    default:
      return "Xem lại các bước giải tương ứng với dạng bài này.";
  }
}

/** Chuẩn hóa phân số / ký hiệu toán trong text thường */
export function normalizeMathText(text: string): string {
  return text
    .replace(/\$(\d+)\s*\/\s*(\d+)\$/g, "$1/$2")
    .replace(/\$([^$]{1,80})\$/g, "$1")
    .replace(/(\d+)\s*\*\s*\(\s*(\d+)\s*\/\s*(\d+)\s*\)/g, "$1 × ($2/$3)")
    .replace(/\s{2,}/g, " ")
    .trim();
}
