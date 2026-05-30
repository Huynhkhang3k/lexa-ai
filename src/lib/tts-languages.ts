/** Ngôn ngữ hỗ trợ đọc (TTS) — không bao gồm tiếng Việt */
export type TtsLangCode = Exclude<(typeof TTS_LANGUAGES)[number]["code"], "vi">;

export const TTS_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh-CN", label: "中文 (Giản thể)" },
  { code: "zh-TW", label: "中文 (Phồn thể)" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "th", label: "ไทย" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "ms", label: "Bahasa Melayu" },
  { code: "fil", label: "Filipino" },
  { code: "tr", label: "Türkçe" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
  { code: "el", label: "Ελληνικά" },
  { code: "cs", label: "Čeština" },
  { code: "ro", label: "Română" },
  { code: "hu", label: "Magyar" },
  { code: "sv", label: "Svenska" },
  { code: "no", label: "Norsk" },
  { code: "da", label: "Dansk" },
  { code: "fi", label: "Suomi" },
  { code: "ca", label: "Català" },
  { code: "hr", label: "Hrvatski" },
  { code: "sk", label: "Slovenčina" },
  { code: "sl", label: "Slovenščina" },
  { code: "bg", label: "Български" },
  { code: "sr", label: "Српски" },
  { code: "et", label: "Eesti" },
  { code: "lv", label: "Latviešu" },
  { code: "lt", label: "Lietuvių" },
  { code: "bn", label: "বাংলা" },
  { code: "ur", label: "اردو" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "fa", label: "فارسی" },
  { code: "he", label: "עברית" },
  { code: "sw", label: "Kiswahili" },
] as const;

const VI_RE =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export function isVietnameseDominant(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const viHits = (t.match(VI_RE) || []).length;
  if (viHits === 0) return false;
  const letters = (t.match(/\p{L}/gu) || []).length;
  return viHits >= 2 || viHits / Math.max(letters, 1) >= 0.12;
}

export function getTtsLangLabel(code: string): string {
  return TTS_LANGUAGES.find((l) => l.code === code)?.label ?? code;
}

export function normalizeTtsLang(code: string): TtsLangCode {
  const exact = TTS_LANGUAGES.find((l) => l.code === code);
  if (exact) return exact.code;
  const base = code.split("-")[0]!;
  const partial = TTS_LANGUAGES.find(
    (l) => l.code === base || l.code.startsWith(`${base}-`),
  );
  return (partial?.code ?? "en") as TtsLangCode;
}

/** Chọn đoạn văn nước ngoài để đọc — bỏ qua tiếng Việt */
export function pickForeignSpeakText(options: {
  input: string;
  output: string;
  detectedLang?: "en" | "vi";
  targetLang: "en" | "vi";
}): { text: string; lang: TtsLangCode } | null {
  const inp = options.input.trim();
  const out = options.output.trim();
  const detected = options.detectedLang;

  if (options.targetLang === "en" && out && !isVietnameseDominant(out)) {
    return { text: out, lang: "en" };
  }

  if (options.targetLang === "vi" && out) {
    if (detected === "en" && inp && !isVietnameseDominant(inp)) {
      return { text: inp, lang: "en" };
    }
    if (inp && !isVietnameseDominant(inp) && isVietnameseDominant(out)) {
      return { text: inp, lang: "en" };
    }
    return null;
  }

  if (inp && !isVietnameseDominant(inp)) {
    return { text: inp, lang: detected === "en" ? "en" : "en" };
  }

  if (out && !isVietnameseDominant(out)) {
    return { text: out, lang: "en" };
  }

  return null;
}
