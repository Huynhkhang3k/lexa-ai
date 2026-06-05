/** Mã ngôn ngữ nội bộ (ISO 639-1) */
export type AppLangCode = "en" | "vi";

/** Hiển thị mã viết tắt: Việt Nam = VIE (không dùng VI) */
export function formatLangAbbrev(code: AppLangCode | string | undefined | null): string {
  if (code === "en") return "EN";
  if (code === "vi") return "VIE";
  return "—";
}

export function langPairLabel(from: AppLangCode | "auto", to: AppLangCode): string {
  const src = from === "auto" ? "AUTO" : formatLangAbbrev(from);
  return `${src} ↔ ${formatLangAbbrev(to)}`;
}
