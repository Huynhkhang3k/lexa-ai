"use client";

import * as React from "react";
import { Gauge, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TTS_LANGUAGES,
  getTtsLangLabel,
  isVietnameseDominant,
  type TtsLangCode,
} from "@/lib/tts-languages";
import { replayText, speakText, type SpeechRate } from "@/components/translate/tts";

type Props = {
  text: string;
  defaultLang?: TtsLangCode;
  className?: string;
  size?: "sm" | "md";
};

export function ForeignVoiceControls({
  text,
  defaultLang = "en",
  className,
  size = "sm",
}: Props) {
  const [lang, setLang] = React.useState<TtsLangCode>(defaultLang);
  const [rate, setRate] = React.useState<SpeechRate>("normal");

  React.useEffect(() => {
    setLang(defaultLang);
  }, [defaultLang]);

  const blocked = !text.trim() || isVietnameseDominant(text);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as TtsLangCode)}
        disabled={blocked}
        aria-label="Chọn ngôn ngữ đọc"
        className="max-w-[148px] rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 dark:border-white/15 dark:bg-black/30 dark:text-white sm:max-w-[180px] sm:text-sm"
      >
        {TTS_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>

      <Button
        type="button"
        size={size}
        variant="secondary"
        disabled={blocked}
        onClick={() => speakText(text, lang, { rate })}
        aria-label={`Đọc bằng ${getTtsLangLabel(lang)}`}
        title={blocked ? "Tiếng Việt không hỗ trợ đọc" : undefined}
      >
        <Volume2 className="h-4 w-4" />
        <span className="hidden sm:inline">Nghe</span>
      </Button>

      <Button
        type="button"
        size={size}
        variant="secondary"
        disabled={blocked}
        onClick={() => replayText({ rate })}
        aria-label="Nghe lại"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="hidden sm:inline">Nghe lại</span>
      </Button>

      <Button
        type="button"
        size={size}
        variant="secondary"
        disabled={blocked}
        onClick={() => setRate((r) => (r === "normal" ? "slow" : "normal"))}
        aria-label="Tốc độ đọc"
        className={rate === "slow" ? "ring-1 ring-sky-500/50" : undefined}
      >
        <Gauge className="h-4 w-4" />
        {rate === "normal" ? "Bình thường" : "Chậm"}
      </Button>
    </div>
  );
}

/** Giữ tên export cũ để không phá import */
export const EnglishVoiceControls = ForeignVoiceControls;

export function DictionaryVoiceControls({ word, className }: { word: string; className?: string }) {
  return (
    <ForeignVoiceControls
      text={word}
      defaultLang="en"
      className={className}
      size="sm"
    />
  );
}
