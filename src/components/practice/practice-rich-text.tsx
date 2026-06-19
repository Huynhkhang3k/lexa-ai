"use client";

import * as React from "react";
import katex from "katex";
import { normalizeMathText } from "@/lib/practice-explanation";

function MathSpan({ tex, display }: { tex: string; display: boolean }) {
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    try {
      katex.render(tex, el, {
        throwOnError: false,
        displayMode: display,
        strict: "ignore",
      });
    } catch {
      el.textContent = tex;
    }
  }, [tex, display]);

  if (display) {
    return (
      <div className="my-2 overflow-x-auto rounded-lg bg-slate-50/80 px-2 py-1.5 text-center dark:bg-white/5">
        <span ref={ref} className="inline-block" />
      </div>
    );
  }
  return <span ref={ref} className="mx-0.5 inline-block align-middle" />;
}

/** Render **bold**, $inline$ / $$block$$ — không tách số trong công thức */
function MathRichText({ text }: { text: string }) {
  const regex =
    /(\*\*.+?\*\*|\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\])/g;
  const parts = text.split(regex).filter((p) => p.length > 0);

  return (
    <>
      {parts.map((part, i) => {
        const bold = part.match(/^\*\*(.+)\*\*$/);
        if (bold) {
          return (
            <strong key={i} className="font-semibold text-slate-900 dark:text-white">
              {bold[1]}
            </strong>
          );
        }

        const blockMath =
          part.match(/^\$\$([\s\S]+)\$\$$/) ?? part.match(/^\\\[([\s\S]+)\\\]$/);
        if (blockMath) {
          return <MathSpan key={i} tex={blockMath[1]!.trim()} display />;
        }

        const inlineMath =
          part.match(/^\$([^$\n]+)\$$/) ?? part.match(/^\\\(([\s\S]+?)\\\)$/);
        if (inlineMath) {
          return <MathSpan key={i} tex={inlineMath[1]!.trim()} display={false} />;
        }

        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

/** Chỉ tách bước khi có xuống dòng + số thứ tự ở đầu dòng */
function splitExplanationSteps(text: string): string[] {
  const t = text.trim();
  if (!t) return [];

  const byNewline = t.split(/\n(?=\d+\.\s+)/).map((s) => s.trim()).filter(Boolean);
  if (byNewline.length > 1) {
    return byNewline.map((s) => s.replace(/^\d+\.\s*/, ""));
  }

  return [t];
}

type Props = {
  text: string;
  variant?: "question" | "explanation";
  asSteps?: boolean;
};

export function PracticeRichText({ text, variant = "question", asSteps }: Props) {
  const normalized = normalizeMathText(text);

  if (variant === "question") {
    return (
      <p className="text-[15px] leading-[1.75] text-slate-800 dark:text-white/90 sm:text-base">
        <MathRichText text={normalized} />
      </p>
    );
  }

  const steps = asSteps !== false ? splitExplanationSteps(normalized) : [normalized];

  if (steps.length <= 1) {
    return (
      <p className="text-sm leading-relaxed text-slate-700 dark:text-white/80">
        <MathRichText text={steps[0] ?? normalized} />
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
            <MathRichText text={step} />
          </span>
        </li>
      ))}
    </ol>
  );
}
