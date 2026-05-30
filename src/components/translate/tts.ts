import { normalizeTtsLang, type TtsLangCode } from "@/lib/tts-languages";

export type SpeechRate = "normal" | "slow";

const SLOW_RATE = 0.82;
const NORMAL_RATE = 1;

let lastUtterance: { text: string; lang: TtsLangCode; rate: SpeechRate } | null = null;

function listVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined") return [];
  return window.speechSynthesis.getVoices() ?? [];
}

function pickVoiceForLang(langCode: string): SpeechSynthesisVoice | undefined {
  const voices = listVoices();
  if (!voices.length) return undefined;

  const normalized = normalizeTtsLang(langCode);
  const base = normalized.split("-")[0]!;

  const exact = voices.filter((v) => v.lang === normalized);
  if (exact.length) {
    const natural = exact.find((v) => /google|natural|premium|enhanced/i.test(v.name));
    return natural ?? exact[0];
  }

  const prefix = voices.filter(
    (v) => v.lang === base || v.lang?.startsWith(`${base}-`),
  );
  if (prefix.length) return prefix[0];

  return voices.find((v) => v.lang?.startsWith(base));
}

export function speakText(
  text: string,
  langCode: TtsLangCode | string,
  opts?: { rate?: SpeechRate },
) {
  if (typeof window === "undefined") return;
  const cleaned = text.trim();
  if (!cleaned) return;

  const lang = normalizeTtsLang(langCode);
  const rate = opts?.rate ?? "normal";

  lastUtterance = { text: cleaned, lang, rate };

  const u = new SpeechSynthesisUtterance(cleaned);
  u.lang = lang;
  u.rate = rate === "slow" ? SLOW_RATE : NORMAL_RATE;
  u.pitch = 1;
  u.voice = pickVoiceForLang(lang) ?? null;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function replayText(opts?: { rate?: SpeechRate }) {
  if (!lastUtterance) return;
  speakText(lastUtterance.text, lastUtterance.lang, {
    rate: opts?.rate ?? lastUtterance.rate,
  });
}

/** @deprecated use speakText */
export function speakEnglish(text: string, opts?: { rate?: SpeechRate }) {
  speakText(text, "en", opts);
}

/** @deprecated use replayText */
export function replayEnglish(opts?: { rate?: SpeechRate }) {
  replayText(opts);
}

export function primeVoices(onReady?: () => void) {
  if (typeof window === "undefined") return;
  const handle = () => onReady?.();
  window.speechSynthesis.onvoiceschanged = handle;
  window.speechSynthesis.getVoices();
}
