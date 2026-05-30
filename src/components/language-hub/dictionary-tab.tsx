"use client";

import * as React from "react";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DictionaryVoiceControls } from "@/components/language-hub/english-voice-controls";
import {
  getRecentSearches,
  getSavedVocabulary,
  isWordSaved,
  pushRecentSearch,
  removeSavedWord,
  saveVocabularyEntry,
  type SavedWord,
} from "@/lib/vocabulary-storage";

export type DictionaryEntry = {
  word: string;
  ipa: string;
  phonetic: string;
  syllables: string[];
  partOfSpeech: string;
  meaning: string;
  synonyms: string[];
  antonyms: string[];
  examples: string[];
  collocations: string[];
  idioms: string[];
  phrasalVerbs: string[];
  formality: string;
  frequency: string;
  difficulty: string;
  usageNotes: string[];
  nativeNotes: string[];
};

export function DictionaryTab() {
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [entry, setEntry] = React.useState<DictionaryEntry | null>(null);
  const [recent, setRecent] = React.useState<string[]>([]);
  const [saved, setSaved] = React.useState<SavedWord[]>([]);

  React.useEffect(() => {
    setRecent(getRecentSearches());
    setSaved(getSavedVocabulary());
  }, []);

  async function lookup(word?: string) {
    const w = (word ?? query).trim();
    if (!w) return;
    setQuery(w);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: w }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Dictionary lỗi");
      setEntry(json as DictionaryEntry);
      pushRecentSearch(w);
      setRecent(getRecentSearches());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi mạng");
      setEntry(null);
    } finally {
      setLoading(false);
    }
  }

  function toggleSave() {
    if (!entry) return;
    if (isWordSaved(entry.word)) {
      removeSavedWord(entry.word);
    } else {
      saveVocabularyEntry({
        word: entry.word,
        meaning: entry.meaning,
        partOfSpeech: entry.partOfSpeech,
        difficulty: entry.difficulty,
      });
    }
    setSaved(getSavedVocabulary());
  }

  const wordSaved = entry ? isWordSaved(entry.word) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"
    >
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Tra từ · Học từ vựng
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
              IPA, nghĩa, từ đồng nghĩa, collocation, idiom, phrasal verb và ví dụ.
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 dark:border-white/10 dark:bg-black/30">
                <Search className="h-5 w-5 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && lookup()}
                  placeholder="Nhập từ tiếng Anh… (VD: resilient)"
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
              </div>
              <Button type="button" onClick={() => lookup()} disabled={loading || !query.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tra…
                  </>
                ) : (
                  "Tra từ"
                )}
              </Button>
            </div>

            {error ? (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
            ) : null}
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {entry ? (
            <motion.div
              key={entry.word}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="space-y-8 p-6 sm:p-8">
                  <header className="flex flex-col gap-4 border-b border-slate-200/70 pb-6 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        {entry.word}
                      </h2>
                      <p className="mt-2 font-mono text-lg text-sky-700 dark:text-cyan-300">
                        {entry.ipa}
                        {entry.phonetic ? ` · /${entry.phonetic}/` : ""}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Tag>{entry.partOfSpeech}</Tag>
                        <Tag>{entry.difficulty}</Tag>
                        <Tag>{entry.frequency}</Tag>
                        <Tag>{entry.formality}</Tag>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <DictionaryVoiceControls word={entry.word} />
                      <Button type="button" variant="secondary" size="sm" onClick={toggleSave}>
                        {wordSaved ? (
                          <>
                            <BookmarkCheck className="h-4 w-4 text-sky-600" /> Đã lưu
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4" /> Lưu từ vựng
                          </>
                        )}
                      </Button>
                    </div>
                  </header>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/55">
                      Nghĩa
                    </h3>
                    <p className="mt-3 text-lg leading-relaxed text-slate-800 dark:text-white/90">
                      {entry.meaning}
                    </p>
                  </section>

                  <div className="grid gap-6 md:grid-cols-2">
                    <WordList title="Đồng nghĩa" items={entry.synonyms} />
                    <WordList title="Trái nghĩa" items={entry.antonyms} />
                    <WordList title="Collocations" items={entry.collocations} />
                    <WordList title="Idioms" items={entry.idioms} />
                    <WordList title="Phrasal verbs" items={entry.phrasalVerbs} className="md:col-span-2" />
                  </div>

                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/55">
                      Ví dụ
                    </h3>
                    <ul className="mt-3 grid gap-2">
                      {(entry.examples ?? []).slice(0, 6).map((ex, i) => (
                        <li
                          key={i}
                          className="rounded-xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/85"
                        >
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {(entry.usageNotes?.length || entry.nativeNotes?.length) ? (
                    <section className="grid gap-4 md:grid-cols-2">
                      {entry.usageNotes?.length ? (
                        <NoteList title="Ghi chú sử dụng" items={entry.usageNotes} />
                      ) : null}
                      {entry.nativeNotes?.length ? (
                        <NoteList title="Mẹo bản xứ" items={entry.nativeNotes} />
                      ) : null}
                    </section>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-sm text-slate-500 dark:text-white/45">
                  Nhập một từ và bấm Tra từ để xem nghĩa, phát âm và ví dụ.
                </p>
              </CardContent>
            </Card>
          )}
        </AnimatePresence>
      </div>

      <aside className="grid gap-4 content-start">
        <SidePanel title="Tìm gần đây" icon={Clock}>
          {recent.length ? (
            <div className="flex flex-wrap gap-2">
              {recent.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => lookup(w)}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-200 dark:bg-white/8 dark:text-white/85 dark:hover:bg-white/12"
                >
                  {w}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-white/45">Chưa có lịch sử.</p>
          )}
        </SidePanel>

        <SidePanel title="Từ đã lưu" icon={Bookmark}>
          {saved.length ? (
            <ul className="grid gap-2">
              {saved.slice(0, 10).map((w) => (
                <li
                  key={w.word}
                  className="group flex items-start justify-between gap-2 rounded-xl bg-slate-50/80 p-3 dark:bg-white/[0.04]"
                >
                  <button
                    type="button"
                    onClick={() => lookup(w.word)}
                    className="min-w-0 text-left"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white">{w.word}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-slate-600 dark:text-white/60">
                      {w.meaning}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeSavedWord(w.word);
                      setSaved(getSavedVocabulary());
                    }}
                    className="shrink-0 rounded-lg p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-red-500"
                    aria-label={`Remove ${w.word}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-white/45">
              Lưu từ để ôn lại sau.
            </p>
          )}
        </SidePanel>
      </aside>
    </motion.div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800 dark:bg-cyan-500/15 dark:text-cyan-200">
      {children}
    </span>
  );
}

function WordList({
  title,
  items,
  className,
}: {
  title: string;
  items: string[];
  className?: string;
}) {
  if (!items?.length) return null;
  return (
    <section className={className}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/55">
        {title}
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.slice(0, 12).map((item) => (
          <span
            key={item}
            className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-700 dark:bg-white/8 dark:text-white/80"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function NoteList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/55">
        {title}
      </h3>
      <ul className="mt-2 grid gap-1 text-sm text-slate-700 dark:text-white/75">
        {items.slice(0, 5).map((n, i) => (
          <li key={i}>• {n}</li>
        ))}
      </ul>
    </div>
  );
}

function SidePanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Icon className="h-4 w-4 text-sky-600 dark:text-cyan-300" />
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{title}</div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
