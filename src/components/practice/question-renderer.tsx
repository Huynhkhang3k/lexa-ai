"use client";

import * as React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { optionLetter, stripOptionPrefix } from "@/lib/practice-answer-label";
import type { PracticeAnswer, PracticeQuestion } from "@/lib/practice-types";
import { PracticeRichText } from "./practice-rich-text";
import { PracticeVisualPanel } from "./practice-visual";

type Props = {
  question: PracticeQuestion;
  answer: PracticeAnswer | undefined;
  onChange: (answer: PracticeAnswer) => void;
  disabled?: boolean;
  revealed?: boolean;
};

type OptionVisual = "default" | "picked" | "correct" | "wrong";

function optionVisual(
  idx: number,
  picked: boolean,
  revealed: boolean,
  correctIndex: number | undefined,
): OptionVisual {
  if (!revealed) return picked ? "picked" : "default";
  if (correctIndex === idx) return "correct";
  if (picked) return "wrong";
  return "default";
}

const OPTION_STYLES: Record<OptionVisual, string> = {
  default:
    "border-slate-200 bg-white hover:border-sky-300 dark:border-white/10 dark:bg-black/20",
  picked:
    "border-sky-400 bg-sky-50 ring-2 ring-sky-200/60 dark:border-cyan-400/50 dark:bg-cyan-400/10 dark:ring-cyan-400/20",
  correct:
    "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200/70 dark:border-emerald-500/50 dark:bg-emerald-500/15 dark:ring-emerald-500/25",
  wrong:
    "border-rose-400 bg-rose-50 ring-2 ring-rose-200/60 dark:border-rose-500/50 dark:bg-rose-500/15 dark:ring-rose-500/25",
};

function OptionBtn({
  letter,
  visual,
  onClick,
  disabled,
  children,
}: {
  letter: string;
  visual: OptionVisual;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-sm transition",
        OPTION_STYLES[visual],
        disabled ? "cursor-default" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
          visual === "correct"
            ? "bg-emerald-500 text-white"
            : visual === "wrong"
              ? "bg-rose-500 text-white"
              : visual === "picked"
                ? "bg-sky-500 text-white"
                : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-white/80",
        ].join(" ")}
      >
        {letter}
      </span>
      <span className="flex-1 pt-1 leading-relaxed text-slate-800 dark:text-white/90">
        {children}
      </span>
      {visual === "correct" ? (
        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" />
      ) : null}
      {visual === "wrong" ? (
        <XCircle className="mt-1 h-5 w-5 shrink-0 text-rose-500" />
      ) : null}
    </button>
  );
}

export function QuestionRenderer({ question, answer, onChange, disabled, revealed }: Props) {
  const q = question;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-sky-50/40 px-5 py-4 dark:border-white/10 dark:from-white/[0.04] dark:to-cyan-500/[0.06]">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-cyan-400">
          Đề bài
        </div>
        <PracticeRichText text={q.prompt} variant="question" />
      </div>

      {q.visual ? (
        <PracticeVisualPanel
          question={q}
          interactive={
            !disabled &&
            (q.type === "graph_pick" || q.type === "geo_pick" || q.type === "geo_drag")
          }
          onPick={
            q.type === "graph_pick" || q.type === "geo_pick"
              ? (x, y) =>
                  onChange(
                    q.type === "graph_pick"
                      ? { type: "graph_pick", x, y }
                      : { type: "geo_pick", x, y },
                  )
              : undefined
          }
          onDragUpdate={
            q.type === "geo_drag"
              ? (points) => onChange({ type: "geo_drag", points })
              : undefined
          }
        />
      ) : null}

      {q.type === "mcq" && q.options ? (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Chọn một đáp án
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {q.options.map((opt, idx) => {
              const picked = answer?.type === "mcq" && answer.index === idx;
              const vis = optionVisual(idx, !!picked, !!revealed, q.correctIndex);
              return (
                <OptionBtn
                  key={opt}
                  letter={optionLetter(idx)}
                  visual={vis}
                  disabled={disabled}
                  onClick={() => onChange({ type: "mcq", index: idx })}
                >
                  {stripOptionPrefix(opt)}
                </OptionBtn>
              );
            })}
          </div>
        </div>
      ) : null}

      {q.type === "multi_select" && q.options ? (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Chọn các đáp án đúng
          </div>
          <div className="grid gap-3">
            {q.options.map((opt, idx) => {
              const picked =
                answer?.type === "multi_select" && answer.indices.includes(idx);
              const isCorrect = revealed && q.correctIndices?.includes(idx);
              const isWrong = revealed && picked && !isCorrect;
              return (
                <label
                  key={opt}
                  className={[
                    "flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-sm transition",
                    isCorrect
                      ? OPTION_STYLES.correct
                      : isWrong
                        ? OPTION_STYLES.wrong
                        : picked
                          ? OPTION_STYLES.picked
                          : OPTION_STYLES.default,
                    disabled ? "cursor-default" : "",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                      isCorrect
                        ? "bg-emerald-500 text-white"
                        : isWrong
                          ? "bg-rose-500 text-white"
                          : picked
                            ? "bg-sky-500 text-white"
                            : "bg-slate-100 text-slate-600 dark:bg-white/10",
                    ].join(" ")}
                  >
                    {optionLetter(idx)}
                  </span>
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={!!picked}
                    className="sr-only"
                    onChange={() => {
                      const prev =
                        answer?.type === "multi_select" ? answer.indices : [];
                      const next = picked
                        ? prev.filter((i) => i !== idx)
                        : [...prev, idx];
                      onChange({ type: "multi_select", indices: next });
                    }}
                  />
                  <span className="flex-1">{stripOptionPrefix(opt)}</span>
                  {isCorrect ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : null}
                  {isWrong ? <XCircle className="h-5 w-5 text-rose-500" /> : null}
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      {q.type === "true_false" ? (
        <div className="flex gap-3">
          {[
            { label: "Đúng", value: true, letter: "✓" },
            { label: "Sai", value: false, letter: "✗" },
          ].map(({ label, value, letter }) => {
            const picked = answer?.type === "true_false" && answer.value === value;
            const vis: OptionVisual =
              revealed && q.correctBool === value
                ? "correct"
                : revealed && picked
                  ? "wrong"
                  : picked
                    ? "picked"
                    : "default";
            return (
              <OptionBtn
                key={label}
                letter={letter}
                visual={vis}
                disabled={disabled}
                onClick={() => onChange({ type: "true_false", value })}
              >
                {label}
              </OptionBtn>
            );
          })}
        </div>
      ) : null}

      {q.type === "fill_number" ? (
        <input
          type="number"
          step={1}
          disabled={disabled}
          value={answer?.type === "fill_number" ? answer.value : ""}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v)) onChange({ type: "fill_number", value: v });
          }}
          placeholder="Nhập số nguyên hoặc số tự nhiên"
          className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-white/15 dark:bg-black/30 dark:text-white"
        />
      ) : null}

      {q.type === "fill_sign" ? (
        <div className="flex gap-3">
          {(["<", ">", "="] as const).map((sign, idx) => {
            const picked = answer?.type === "fill_sign" && answer.value === sign;
            const vis: OptionVisual =
              revealed && q.correctSign === sign
                ? "correct"
                : revealed && picked
                  ? "wrong"
                  : picked
                    ? "picked"
                    : "default";
            return (
              <OptionBtn
                key={sign}
                letter={optionLetter(idx)}
                visual={vis}
                disabled={disabled}
                onClick={() => onChange({ type: "fill_sign", value: sign })}
              >
                {sign}
              </OptionBtn>
            );
          })}
        </div>
      ) : null}

      {q.type === "match" && q.matchLeft && q.matchRight ? (
        <MatchQuestion
          left={q.matchLeft}
          right={q.matchRight}
          pairs={answer?.type === "match" ? answer.pairs : []}
          disabled={disabled}
          onChange={(pairs) => onChange({ type: "match", pairs })}
        />
      ) : null}

      {q.type === "order" && q.orderItems ? (
        <OrderQuestion
          items={q.orderItems}
          order={answer?.type === "order" ? answer.order : q.orderItems.map((_, i) => i)}
          disabled={disabled}
          onChange={(order) => onChange({ type: "order", order })}
        />
      ) : null}

      {q.type === "drag_drop" && q.dragItems && q.dropSlots ? (
        <DragDropQuestion
          items={q.dragItems}
          slots={q.dropSlots}
          mapping={
            answer?.type === "drag_drop"
              ? answer.mapping
              : q.dragItems.map(() => -1)
          }
          disabled={disabled}
          onChange={(mapping) => onChange({ type: "drag_drop", mapping })}
        />
      ) : null}

      {(q.type === "graph_pick" || q.type === "geo_pick") && answer ? (
        <p className="text-xs text-slate-500">
          Đã chọn: ({answer.type === "graph_pick" || answer.type === "geo_pick" ? `${answer.x}, ${answer.y}` : ""})
        </p>
      ) : null}

      {q.type === "geo_drag" ? (
        <p className="text-xs text-slate-500">
          Kéo điểm trên hình để thỏa điều kiện trong đề bài.
        </p>
      ) : null}
    </div>
  );
}

function MatchQuestion({
  left,
  right,
  pairs,
  disabled,
  onChange,
}: {
  left: string[];
  right: string[];
  pairs: [number, number][];
  disabled?: boolean;
  onChange: (pairs: [number, number][]) => void;
}) {
  const [selectedLeft, setSelectedLeft] = React.useState<number | null>(null);

  function pairForLeft(li: number) {
    return pairs.find(([l]) => l === li)?.[1];
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        {left.map((item, li) => (
          <button
            key={item}
            type="button"
            disabled={disabled}
            onClick={() => setSelectedLeft(li)}
            className={[
              "w-full rounded-xl border px-3 py-2 text-left text-sm",
              selectedLeft === li
                ? "border-sky-400 bg-sky-50"
                : "border-slate-200 bg-white dark:border-white/10 dark:bg-black/20",
            ].join(" ")}
          >
            {item}
            {pairForLeft(li) !== undefined ? ` → ${right[pairForLeft(li)!]}` : ""}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {right.map((item, ri) => (
          <button
            key={item}
            type="button"
            disabled={disabled || selectedLeft === null}
            onClick={() => {
              if (selectedLeft === null) return;
              const next = pairs.filter(([l]) => l !== selectedLeft);
              next.push([selectedLeft, ri]);
              onChange(next);
              setSelectedLeft(null);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm dark:border-white/10 dark:bg-black/20"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function OrderQuestion({
  items,
  order,
  disabled,
  onChange,
}: {
  items: string[];
  order: number[];
  disabled?: boolean;
  onChange: (order: number[]) => void;
}) {
  return (
    <div className="space-y-2">
      {order.map((itemIdx, pos) => (
        <div key={pos} className="flex items-center gap-2">
          <span className="w-6 text-xs text-slate-500">{pos + 1}.</span>
          <select
            disabled={disabled}
            value={itemIdx}
            onChange={(e) => {
              const next = [...order];
              next[pos] = Number(e.target.value);
              onChange(next);
            }}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-black/30 dark:text-white"
          >
            {items.map((item, i) => (
              <option key={item} value={i}>
                {item}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

function DragDropQuestion({
  items,
  slots,
  mapping,
  disabled,
  onChange,
}: {
  items: string[];
  slots: string[];
  mapping: number[];
  disabled?: boolean;
  onChange: (mapping: number[]) => void;
}) {
  const [dragging, setDragging] = React.useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <button
            key={item}
            type="button"
            draggable={!disabled}
            disabled={disabled}
            onDragStart={() => setDragging(i)}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-500/40 dark:bg-emerald-500/10"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid gap-2">
        {slots.map((slot, si) => (
          <div
            key={slot}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragging === null) return;
              const next = [...mapping];
              next[dragging] = si;
              onChange(next);
              setDragging(null);
            }}
            className="min-h-12 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-white/20 dark:bg-white/5"
          >
            {slot}
            {mapping.map((slotIdx, itemIdx) =>
              slotIdx === si ? (
                <span key={itemIdx} className="ml-2 font-medium text-sky-700">
                  ← {items[itemIdx]}
                </span>
              ) : null,
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
