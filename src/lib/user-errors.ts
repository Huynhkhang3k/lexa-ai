/** Chuyển thông báo lỗi kỹ thuật sang câu dễ hiểu cho người dùng */
export function toUserFacingError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("bytestring") || m.includes("65279") || m.includes("feff")) {
    return "Hệ thống AI tạm gặp sự cố. Vui lòng thử lại sau vài giây.";
  }
  if (m.includes("api key") || m.includes("khóa ai") || m.includes("403") || m.includes("401")) {
    return "Chưa kết nối được với AI. Vui lòng thử lại sau.";
  }
  if (m.includes("timeout") || m.includes("quá thời gian")) {
    return "AI phản hồi chậm. Vui lòng thử lại.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Mất kết nối mạng. Kiểm tra internet rồi thử lại.";
  }
  return message;
}
