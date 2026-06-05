"use client";

import * as React from "react";
import {
  ArrowLeftRight,
  Copy,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ForeignVoiceControls } from "@/components/language-hub/english-voice-controls";
import { pickForeignSpeakText } from "@/lib/tts-languages";
import { useGradeLevel } from "@/context/grade-level-context";
import { recordActivity } from "@/lib/user-activity";
import { appendTranslateRecord } from "@/lib/user-history";
import { formatLangAbbrev } from "@/lib/lang-codes";

type Lang = "auto" | "en" | "vi";
type LingoMode = "translate" | "fix" | "improve";

type LingoResp = {
  detectedLang?: "en" | "vi";
  confidence?: number;
  tone?: string;
  translations?: { text: string; label: string }[];
  corrected?: string;
  native?: string;
  issues?: {
    type: string;
    before: string;
    after: string;
    explanation: string;
    tip?: string;
  }[];
  improved?: string;
  notes?: string[];
};

const modes: { id: LingoMode; label: string; hint: string }[] = [
  { id: "translate", label: "Dịch câu", hint: "EN ↔ VIE · gợi ý nhiều bản" },
  { id: "fix", label: "Sửa lỗi", hint: "Ngữ pháp · chính tả" },
  { id: "improve", label: "Viết lại", hint: "Tự nhiên · hay hơn" },
];

export function TranslatorTab() {
  const { gradeLevel } = useGradeLevel();
  const [mode, setMode] = React.useState<LingoMode>("translate");
  const [source, setSource] = React.useState<Lang>("auto");
  const [target, setTarget] = React.useState<Exclude<Lang, "auto">>("vi");
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<LingoResp | null>(null);

  const outputText =
    mode === "translate"
      ? data?.translations?.[0]?.text ?? ""
      : mode === "fix"
        ? data?.corrected ?? ""
        : data?.improved ?? "";

  const speakBundle = React.useMemo(
    () =>
      pickForeignSpeakText({
        input,
        output: outputText,
        detectedLang: data?.detectedLang,
        targetLang: target,
      }),
    [input, outputText, data?.detectedLang, target],
  );

  async function run() {
    const text = input.trim();
    if (!text) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lingo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: text,
          mode,
          sourceLang: source,
          targetLang: target,
          gradeLevel: gradeLevel ?? "thcs",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "AI lỗi");
      setData(json);
      const out =
        mode === "translate"
          ? json.translations?.[0]?.text ?? ""
          : mode === "fix"
            ? json.corrected ?? ""
            : json.improved ?? "";
      if (out.trim()) {
        recordActivity("translate", {
          lastInput: text,
          lastOutput: out.trim(),
          mode,
        });
        appendTranslateRecord({
          mode: modes.find((m) => m.id === mode)?.label ?? mode,
          input: text,
          output: out.trim(),
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi mạng");
    } finally {
      setLoading(false);
    }
  }

  function swapLanguages() {
    const next = target === "vi" ? "en" : "vi";
    setTarget(next);
    if (source !== "auto") setSource(source === "en" ? "vi" : "en");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid gap-6"
    >
      <Card className="overflow-hidden">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id);
                    setData(null);
                    setError(null);
                  }}
                  className={[
                    "rounded-xl px-4 py-2 text-left transition",
                    mode === m.id
                      ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/8 dark:text-white/85 dark:hover:bg-white/12",
                  ].join(" ")}
                >
                  <div className="text-sm font-semibold">{m.label}</div>
                  <div
                    className={[
                      "text-xs",
                      mode === m.id ? "text-white/85" : "text-slate-500 dark:text-white/50",
                    ].join(" ")}
                  >
                    {m.hint}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as Lang)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-white/15 dark:bg-black/30 dark:text-white"
                aria-label="Source language"
              >
                <option value="auto">Tự động</option>
                <option value="en">English</option>
                <option value="vi">Tiếng Việt (VIE)</option>
              </select>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={swapLanguages}
                aria-label="Swap languages"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>

              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as "en" | "vi")}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-white/15 dark:bg-black/30 dark:text-white"
                aria-label="Target language"
              >
                <option value="vi">Tiếng Việt (VIE)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 dark:border-white/10 dark:bg-black/25">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/55">
                Văn bản gốc
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={9}
                placeholder="Nhập câu tiếng Anh hoặc tiếng Việt…"
                className="w-full resize-none bg-transparent text-base leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/35"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" onClick={run} disabled={loading || !input.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý…
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" /> Chạy AI
                    </>
                  )}
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setInput("")}>
                  <X className="h-4 w-4" /> Xóa
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(input)}
                  disabled={!input.trim()}
                >
                  <Copy className="h-4 w-4" /> Sao chép
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-sky-50/50 p-5 dark:border-white/10 dark:from-white/[0.04] dark:to-cyan-500/[0.06]">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/55">
                  Kết quả AI
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ForeignVoiceControls
                    text={speakBundle?.text ?? ""}
                    defaultLang={speakBundle?.lang ?? "en"}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => navigator.clipboard.writeText(outputText)}
                    disabled={!outputText.trim()}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI đang phân tích…
                </div>
              ) : null}

              {error ? (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              ) : null}

              <AnimatePresence mode="popLayout">
                {data ? (
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {mode === "translate" ? (
                      <TranslateResults data={data} />
                    ) : mode === "fix" ? (
                      <FixResults data={data} />
                    ) : (
                      <ImproveResults data={data} />
                    )}
                  </motion.div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-white/45">
                    Nhập văn bản và bấm Chạy AI để dịch, sửa lỗi hoặc viết lại tự nhiên hơn.
                  </p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TranslateResults({ data }: { data: LingoResp }) {
  return (
    <>
      <ResultBlock title="Bản dịch chính">{data.translations?.[0]?.text ?? "—"}</ResultBlock>
      <div className="grid gap-3 sm:grid-cols-2">
        <MetaChip label="Tone" value={data.tone ?? "—"} />
        <MetaChip
          label="Độ tin cậy"
          value={`${Math.round((data.confidence ?? 0.7) * 100)}%`}
        />
        <MetaChip
          label="Ngôn ngữ phát hiện"
          value={formatLangAbbrev(data.detectedLang)}
        />
      </div>
      <Section title="Gợi ý dịch khác">
        <div className="grid gap-2">
          {(data.translations ?? []).slice(0, 3).map((t, i) => (
            <button
              key={`${i}-${t.label}`}
              type="button"
              onClick={() => navigator.clipboard.writeText(t.text)}
              className="rounded-xl bg-white/80 px-4 py-3 text-left transition hover:bg-white dark:bg-black/30 dark:hover:bg-black/40"
            >
              <div className="text-xs font-semibold text-sky-700 dark:text-cyan-300">{t.label}</div>
              <div className="mt-1 text-sm text-slate-800 dark:text-white/90">{t.text}</div>
            </button>
          ))}
        </div>
      </Section>
      <div className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-fuchsia-50/60 p-4 dark:border-fuchsia-500/20 dark:from-fuchsia-500/10 dark:to-violet-500/10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-800 dark:text-fuchsia-200">
          <Sparkles className="h-4 w-4" />
          Viết lại tự nhiên · Giải thích AI
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-white/90">
          {data.native ?? data.improved ?? "—"}
        </p>
      </div>
    </>
  );
}

function FixResults({ data }: { data: LingoResp }) {
  return (
    <>
      <ResultBlock title="Đã sửa">{data.corrected ?? "—"}</ResultBlock>
      <ResultBlock title="Bản tự nhiên">{data.native ?? "—"}</ResultBlock>
      <Section title="Phân tích ngữ pháp">
        <div className="grid gap-2">
          {(data.issues ?? []).slice(0, 8).map((it, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-white/80 p-4 text-sm dark:bg-black/30"
            >
              <div className="text-xs font-semibold text-sky-700 dark:text-cyan-300">{it.type}</div>
              <p className="mt-2">
                <span className="font-medium">Trước:</span> {it.before}
              </p>
              <p className="mt-1">
                <span className="font-medium">Sau:</span> {it.after}
              </p>
              <p className="mt-2 text-slate-600 dark:text-white/65">{it.explanation}</p>
              {it.tip ? (
                <p className="mt-2 text-xs text-slate-500 dark:text-white/50">Mẹo: {it.tip}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function ImproveResults({ data }: { data: LingoResp }) {
  return (
    <>
      <ResultBlock title="Phiên bản cải thiện">{data.improved ?? "—"}</ResultBlock>
      <Section title="Ghi chú AI">
        <ul className="grid gap-1 text-sm text-slate-700 dark:text-white/75">
          {(data.notes ?? []).slice(0, 6).map((n, i) => (
            <li key={i}>• {n}</li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function ResultBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/90 p-4 text-base leading-relaxed text-slate-900 shadow-sm dark:bg-black/35 dark:text-white">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/55">
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-black/20">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/55">
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/80 px-4 py-3 text-sm dark:bg-black/30">
      <span className="font-semibold text-slate-700 dark:text-white/80">{label}:</span>{" "}
      <span className="text-slate-600 dark:text-white/70">{value}</span>
    </div>
  );
}
