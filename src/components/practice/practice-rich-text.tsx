"use client";

import * as React from "react";

/** Tách giải thích thành các bước dễ đọc */
function splitExplanation(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const numbered = trimmed.split(/(?=\d+[\.\)]\s)/).map((s) => s.trim()).filter(Boolean);
  if (numbered.length > 1) return numbered;

  const arrows = trimmed.split(/\s*→\s*/).map((s) => s.trim()).filter(Boolean);
  if (arrows.length > 1) return arrows;

  const sentences = trimmed
    .split(/(?<=[.;])\s+(?=[A-ZÀ-Ỹ0-9(])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
  if (sentences.length > 1) return sentences;

  return [trimmed];
}

function RichSpan({ text }: { text: string }) {
  const parts = text.split(
    /(\d+[,\.]?\d*\s*(?:giây|phút|giờ|m|cm|km|°|%)|T[₀0]?\/T|T\s*=\s*[\d.,]+|√[\d.]+|x²|x³|\d+\/\d+)/g,
  );

  return (
    <>
      {parts.map((part, i) => {
        const isHighlight =
          /^(T[₀0]?\/T|T\s*=|√|\d+\/\d+|\d+[.,]?\d*\s*(giây|phút|m|cm|°))/i.test(part) ||
          part.includes("²") ||
          part.includes("³");
        if (isHighlight && part.length > 0) {
          return (
            <span
              key={i}
              className="rounded bg-sky-100/80 px-1 py-0.5 font-mono text-[0.92em] font-semibold text-sky-900 dark:bg-cyan-400/15 dark:text-cyan-200"
            >
              {part}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

type Props = {
  text: string;
  variant?: "question" | "explanation";
  asSteps?: boolean;
};

export function PracticeRichText({ text, variant = "question", asSteps }: Props) {
  if (variant === "question") {
    return (
      <p className="text-[15px] leading-[1.75] text-slate-800 dark:text-white/90 sm:text-base">
        <RichSpan text={text} />
      </p>
    );
  }

  const steps = asSteps !== false ? splitExplanation(text) : [text];

  if (steps.length <= 1) {
    return (
      <p className="text-sm leading-relaxed text-slate-700 dark:text-white/80">
        <RichSpan text={text} />
      </p>
    );
  }

  return (
    <ol className="space-y-2.5">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-700 dark:text-white/80">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 shadow-sm dark:bg-white/10 dark:text-white/70">
            {i + 1}
          </span>
          <span className="pt-0.5">
            <RichSpan text={step.replace(/^\d+[\.\)]\s*/, "")} />
          </span>
        </li>
      ))}
    </ol>
  );
}
