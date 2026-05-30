"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { LanguageTabs } from "@/components/language-hub/language-tabs";
import type { HubTab } from "@/components/language-hub/types";
import { TranslatorTab } from "@/components/language-hub/translator-tab";
import { DictionaryTab } from "@/components/language-hub/dictionary-tab";
import { primeVoices } from "@/components/translate/tts";

function readTabFromUrl(): HubTab {
  if (typeof window === "undefined") return "translator";
  return new URLSearchParams(window.location.search).get("tab") === "dictionary"
    ? "dictionary"
    : "translator";
}

export default function TranslatePage() {
  const [tab, setTab] = React.useState<HubTab>("translator");
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setTab(readTabFromUrl());
    primeVoices();
    setReady(true);
  }, []);

  function changeTab(next: HubTab) {
    setTab(next);
    const url = next === "dictionary" ? "/translate?tab=dictionary" : "/translate";
    window.history.replaceState(null, "", url);
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_0%,rgba(14,165,233,0.08),transparent_50%)] dark:bg-[radial-gradient(800px_circle_at_20%_0%,rgba(34,211,238,0.14),transparent_50%),radial-gradient(600px_circle_at_90%_20%,rgba(217,70,239,0.10),transparent_55%)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700 dark:border-white/12 dark:bg-white/8 dark:text-white/80">
              <Sparkles className="h-4 w-4 text-sky-600 dark:text-cyan-300" />
              LEXA AI · Dịch thuật
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              AI Dịch thuật
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/60 sm:text-base">
              Dịch câu, sửa ngữ pháp, viết lại tự nhiên và tra từ điển nâng cao — giao diện
              glassmorphism, tối ưu cho học sinh Việt Nam.
            </p>

            <div className="mt-6">
              <LanguageTabs active={tab} onChange={changeTab} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          {!ready ? (
            <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white/60 p-8 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="h-6 w-40 rounded bg-slate-200 dark:bg-white/10" />
              <div className="mt-4 h-32 rounded bg-slate-100 dark:bg-white/8" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {tab === "translator" ? <TranslatorTab /> : <DictionaryTab />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </Container>
  );
}
