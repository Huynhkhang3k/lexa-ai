"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronDown, Filter, Search, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CAREERS, CAREER_FIELD_LABELS, type Career } from "@/lib/careers";
import { CareerImage } from "@/components/career/career-image";
import { getRiasecType, RIASEC_ORDER, type RiasecCode } from "@/lib/holland-riasec";
import { cn } from "@/lib/utils";

function CareerCard({
  career,
  defaultOpen = false,
  highlight = false,
}: {
  career: Career;
  defaultOpen?: boolean;
  highlight?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const primary = getRiasecType(career.riasecPrimary);
  const secondary = getRiasecType(career.riasecSecondary);
  const fieldLabel = CAREER_FIELD_LABELS[career.field];

  React.useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <Card
      id={`career-${career.id}`}
      className={cn(
        "overflow-hidden scroll-mt-24",
        highlight && "ring-2 ring-sky-400 dark:ring-cyan-400/50",
      )}
    >
      <div className="relative">
        {career.imageUrl ? (
          <CareerImage
            careerId={career.id}
            alt={career.name}
            className="rounded-none"
            imageClassName="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : null}
        <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2.5 rounded-xl border border-white/25 bg-black/55 px-2.5 py-2 shadow-lg backdrop-blur-md">
          <div className="relative h-11 w-10 shrink-0 overflow-hidden rounded-md bg-white/10">
            <Image
              src={primary.imageUrl}
              alt={primary.labelVi}
              width={40}
              height={44}
              unoptimized
              className="h-full w-full object-contain object-center p-0.5"
            />
          </div>
          <div className="min-w-0">
            <div className={cn("text-[11px] font-bold uppercase leading-tight tracking-wide text-white")}>
              {primary.labelVi} ({career.riasecPrimary})
            </div>
            <div className="text-[10px] leading-snug text-white/75">
              Phụ: {secondary.labelVi} ({career.riasecSecondary})
            </div>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
      >
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {career.name}
              </h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  primary.bg,
                  primary.color,
                )}
              >
                {career.riasecPrimary} - {primary.labelVi}
              </span>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-cyan-500/15 dark:text-cyan-200">
                {fieldLabel}
              </span>
              {career.highlight ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-400/20 dark:text-amber-200">
                  {career.highlight}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-sky-700 dark:text-cyan-300/90">
              {career.tagline}
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-white/60">
              {career.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {career.skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700 dark:bg-white/8 dark:text-white/70"
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-white/50">
              <span className="font-semibold text-slate-700 dark:text-white/70">
                Lương TB:
              </span>{" "}
              {career.averageSalary}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-slate-500 transition dark:text-white/60",
              open && "rotate-180",
            )}
          />
        </CardHeader>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <CardContent className="border-t border-slate-200 pt-4 dark:border-white/10">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-fuchsia-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Kỹ năng cần có
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {career.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-sm dark:bg-white/10 dark:text-white"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-cyan-300">
                    Môn học liên quan
                  </div>
                  <p className="mt-2 text-sm text-slate-700 dark:text-white/80">
                    {career.relatedSubjects.join(" · ")}
                  </p>
                  <div className="mt-4 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-cyan-300">
                    Môi trường làm việc
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
                    {career.workEnvironment}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-50 to-violet-50 p-4 dark:border-white/10 dark:from-cyan-500/10 dark:to-fuchsia-500/10">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-white/80">
                  Cơ hội & triển vọng
                </div>
                <ul className="mt-2 grid gap-2 text-sm text-slate-700 dark:text-white/75">
                  {career.opportunities.map((o) => (
                    <li key={o} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Lộ trình học tập
                </div>
                <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100/90">
                  {career.studyPath}
                </p>
              </div>
            </CardContent>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {!open ? (
        <div className="px-5 pb-4">
          <span className="text-xs font-medium text-sky-600 dark:text-cyan-400">
            Nhấn để xem chi tiết →
          </span>
        </div>
      ) : null}
    </Card>
  );
}

export default function CareerLibraryPage() {
  const [q, setQ] = React.useState("");
  const [riasec, setRiasec] = React.useState<RiasecCode | "all">("all");
  const [deepLinkId, setDeepLinkId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("career");
    const r = params.get("riasec")?.toUpperCase();
    if (r && RIASEC_ORDER.includes(r as RiasecCode)) {
      setRiasec(r as RiasecCode);
    }
    if (!id) return;
    const career = CAREERS.find((c) => c.id === id);
    if (!career) return;
    setDeepLinkId(id);
    setQ("");
    window.setTimeout(() => {
      document.getElementById(`career-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
  }, []);

  const items = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    return CAREERS.filter((c) => {
      if (riasec !== "all" && c.riasecPrimary !== riasec) return false;
      if (!s) return true;
      const fieldLabel = CAREER_FIELD_LABELS[c.field].toLowerCase();
      const pLabel = getRiasecType(c.riasecPrimary).labelVi.toLowerCase();
      return (
        c.name.toLowerCase().includes(s) ||
        c.tagline.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        c.skills.join(" ").toLowerCase().includes(s) ||
        fieldLabel.includes(s) ||
        pLabel.includes(s)
      );
    });
  }, [q, riasec]);

  const riasecCounts = React.useMemo(() => {
    const map = Object.fromEntries(RIASEC_ORDER.map((code) => [code, 0])) as Record<
      RiasecCode,
      number
    >;
    for (const c of CAREERS) map[c.riasecPrimary] += 1;
    return map;
  }, []);

  function selectRiasec(code: RiasecCode | "all") {
    setRiasec(code);
    const url = new URL(window.location.href);
    if (code === "all") url.searchParams.delete("riasec");
    else url.searchParams.set("riasec", code);
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60">
            Thư viện nghề · {CAREERS.length} nghề · phân loại RIASEC
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Thư viện nghề nghiệp Việt Nam
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/60">
            Lọc theo <strong>nhóm Holland (RIASEC)</strong> hoặc tìm kiếm — mỗi nghề có nhóm chính/phụ,
            kỹ năng, lương và triển vọng.
          </p>
        </div>

        <div className="w-full sm:w-[360px]">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-black/30">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm nghề, kỹ năng…"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
            {q ? (
              <button type="button" onClick={() => setQ("")} aria-label="Xoá">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-fuchsia-50/50 p-4 backdrop-blur-sm dark:border-violet-500/20 dark:from-violet-500/10 dark:to-fuchsia-500/5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-fuchsia-300">
          <Filter className="h-3.5 w-3.5" />
          Lọc theo nhóm Holland (RIASEC)
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectRiasec("all")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              riasec === "all"
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_20px_-4px_rgba(168,85,247,0.5)]"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/8 dark:text-white/80 dark:hover:bg-white/12",
            )}
          >
            Tất cả ({CAREERS.length})
          </button>
          {RIASEC_ORDER.map((code) => {
            const t = getRiasecType(code);
            return (
              <button
                key={code}
                type="button"
                onClick={() => selectRiasec(code)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                  riasec === code
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_20px_-4px_rgba(168,85,247,0.5)]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/8 dark:text-white/80 dark:hover:bg-white/12",
                )}
              >
                {t.labelVi} ({code}) · {riasecCounts[code]}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-white/50">
        {items.length} nghề
        {riasec !== "all" ? ` · ${getRiasecType(riasec).labelVi} (${riasec})` : ""}
        {q.trim() ? ` · từ khoá “${q.trim()}”` : ""}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((c) => (
          <CareerCard
            key={c.id}
            career={c}
            defaultOpen={c.id === deepLinkId}
            highlight={c.id === deepLinkId}
          />
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-500">
          Không tìm thấy nghề phù hợp. Thử đổi bộ lọc RIASEC hoặc từ khoá khác.
        </p>
      ) : null}
    </Container>
  );
}
