"use client";

import * as React from "react";
import katex from "katex";
import { cn } from "@/lib/utils";

const SPEAKER_COLORS = [
  "border-sky-200 bg-sky-50/90 dark:border-cyan-400/25 dark:bg-cyan-400/10",
  "border-violet-200 bg-violet-50/90 dark:border-fuchsia-400/25 dark:bg-fuchsia-400/10",
  "border-emerald-200 bg-emerald-50/90 dark:border-emerald-400/25 dark:bg-emerald-400/10",
  "border-amber-200 bg-amber-50/90 dark:border-amber-400/25 dark:bg-amber-400/10",
] as const;

const SPEAKER_LABEL = [
  "text-sky-700 dark:text-cyan-300",
  "text-violet-700 dark:text-fuchsia-300",
  "text-emerald-700 dark:text-emerald-300",
  "text-amber-800 dark:text-amber-300",
] as const;

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "dialogue"; speaker: string; text: string; note?: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "paragraph"; text: string }
  | { type: "math"; tex: string; display: boolean }
  | { type: "hr" };

function isDialogueSpeaker(name: string) {
  return /^[A-Za-zÀ-ỹ]{2,18}$/.test(name.trim());
}

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let listBuf: { ordered: boolean; items: string[] } | null = null;

  function flushList() {
    if (listBuf?.items.length) {
      blocks.push({ type: "list", ordered: listBuf.ordered, items: listBuf.items });
    }
    listBuf = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? "";
    const line = raw.trim();

    if (!line) {
      flushList();
      continue;
    }

    if (/^---+$/.test(line)) {
      flushList();
      blocks.push({ type: "hr" });
      continue;
    }

    const displayMath =
      line.match(/^\$\$(.+)\$\$$/) ?? line.match(/^\\\[([\s\S]+)\\\]$/);
    if (displayMath) {
      flushList();
      blocks.push({ type: "math", tex: displayMath[1]!.trim(), display: true });
      continue;
    }

    const inlineOnly =
      line.match(/^\$([^$\n]+)\$$/) ?? line.match(/^\\\(([\s\S]+?)\\\)$/);
    if (inlineOnly) {
      flushList();
      blocks.push({ type: "math", tex: inlineOnly[1]!.trim(), display: false });
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushList();
      blocks.push({
        type: "heading",
        level: heading[1]!.length,
        text: heading[2]!.trim(),
      });
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      if (!listBuf || !listBuf.ordered) {
        flushList();
        listBuf = { ordered: true, items: [] };
      }
      listBuf.items.push(ordered[1]!.trim());
      continue;
    }

    const bullet = line.match(/^[-*•]\s+(.+)$/);
    if (bullet) {
      if (!listBuf || listBuf.ordered) {
        flushList();
        listBuf = { ordered: false, items: [] };
      }
      listBuf.items.push(bullet[1]!.trim());
      continue;
    }

    const boldDialogue = line.match(/^\*\*(.+?)\*\*:\s*(.+)$/);
    if (boldDialogue && isDialogueSpeaker(boldDialogue[1]!)) {
      flushList();
      blocks.push({
        type: "dialogue",
        speaker: boldDialogue[1]!.trim(),
        text: boldDialogue[2]!.trim(),
      });
      continue;
    }

    const plainDialogue = line.match(/^([A-Za-zÀ-ỹ]{2,18}):\s*(.+)$/);
    if (plainDialogue && isDialogueSpeaker(plainDialogue[1]!)) {
      flushList();
      const speaker = plainDialogue[1]!.trim();
      const text = plainDialogue[2]!.trim();
      let note: string | undefined;
      const next = lines[i + 1]?.trim() ?? "";
      const noteMatch =
        next.match(/^\*\((.+)\)\*$/) ?? next.match(/^\((.+)\)$/) ?? next.match(/^\*(.+)\*$/);
      if (noteMatch) {
        note = noteMatch[1]!.trim();
        i += 1;
      }
      blocks.push({ type: "dialogue", speaker, text, note });
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: line });
  }

  flushList();
  return blocks;
}

function speakerColorIndex(name: string, map: Map<string, number>) {
  const key = name.toLowerCase();
  if (!map.has(key)) map.set(key, map.size % SPEAKER_COLORS.length);
  return map.get(key)!;
}

function MathSpan({
  tex,
  display,
}: {
  tex: string;
  display: boolean;
}) {
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
      el.textContent = `$${tex}$`;
    }
  }, [tex, display]);

  if (display) {
    return (
      <div className="my-2 overflow-x-auto rounded-xl bg-slate-50 px-3 py-2 text-center dark:bg-white/5">
        <span ref={ref} className="inline-block" />
      </div>
    );
  }
  return <span ref={ref} className="mx-0.5 inline-block align-middle" />;
}

/** Hỗ trợ **bold**, $inline$ / $$block$$ / \\(...\\) / \\[...\\] LaTeX */
function RichText({ text }: { text: string }) {
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

export function ChatMessageContent({ content }: { content: string }) {
  const blocks = React.useMemo(() => parseBlocks(content), [content]);
  const speakerMap = React.useMemo(() => new Map<string, number>(), []);

  return (
    <div className="space-y-3 text-sm leading-6">
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          const Tag = block.level <= 2 ? "h3" : "h4";
          return (
            <Tag
              key={idx}
              className={cn(
                "font-semibold text-slate-900 dark:text-white",
                block.level === 1 && "text-base",
                block.level === 2 && "text-sm",
                block.level === 3 &&
                  "text-xs uppercase tracking-wide text-violet-700 dark:text-fuchsia-300",
              )}
            >
              <RichText text={block.text} />
            </Tag>
          );
        }

        if (block.type === "math") {
          return <MathSpan key={idx} tex={block.tex} display={block.display} />;
        }

        if (block.type === "hr") {
          return <hr key={idx} className="border-slate-200 dark:border-white/10" />;
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={idx}
              className={cn("space-y-1.5 pl-5", block.ordered ? "list-decimal" : "list-disc")}
            >
              {block.items.map((item, j) => (
                <li key={j} className="text-slate-700 dark:text-white/85">
                  <RichText text={item} />
                </li>
              ))}
            </ListTag>
          );
        }

        if (block.type === "dialogue") {
          const ci = speakerColorIndex(block.speaker, speakerMap);
          return (
            <div
              key={idx}
              className={cn("rounded-xl border px-3 py-2.5", SPEAKER_COLORS[ci])}
            >
              <div
                className={cn(
                  "text-xs font-bold uppercase tracking-wide",
                  SPEAKER_LABEL[ci],
                )}
              >
                {block.speaker}
              </div>
              <p className="mt-1 text-[15px] leading-relaxed text-slate-800 dark:text-white/90">
                <RichText text={block.text} />
              </p>
              {block.note ? (
                <p className="mt-1 border-t border-slate-200/80 pt-1.5 text-xs italic text-slate-500 dark:border-white/10 dark:text-white/50">
                  {block.note}
                </p>
              ) : null}
            </div>
          );
        }

        return (
          <p key={idx} className="text-slate-700 dark:text-white/85">
            <RichText text={block.text} />
          </p>
        );
      })}

      {blocks.length === 0 ? (
        <p className="whitespace-pre-wrap">
          <RichText text={content} />
        </p>
      ) : null}
    </div>
  );
}
