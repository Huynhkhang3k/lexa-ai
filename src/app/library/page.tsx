"use client";

import * as React from "react";
import { ChevronDown, Filter, Search, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  CAREERS,
  CAREER_FIELD_IDS,
  CAREER_FIELD_LABELS,
  type Career,
  type CareerFieldId,
} from "@/lib/careers";
import { cn } from "@/lib/utils";

function CareerCard({ career }: { career: Career }) {
  const [open, setOpen] = React.useState(false);
  const fieldLabel = CAREER_FIELD_LABELS[career.field];

  return (
    <Card className="overflow-hidden">
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
  const [field, setField] = React.useState<CareerFieldId | "all">("all");

  const items = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    return CAREERS.filter((c) => {
      if (field !== "all" && c.field !== field) return false;
      if (!s) return true;
      const fieldLabel = CAREER_FIELD_LABELS[c.field].toLowerCase();
      return (
        c.name.toLowerCase().includes(s) ||
        c.tagline.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        c.skills.join(" ").toLowerCase().includes(s) ||
        fieldLabel.includes(s)
      );
    });
  }, [q, field]);

  const counts = React.useMemo(() => {
    const map = Object.fromEntries(
      CAREER_FIELD_IDS.map((id) => [id, 0]),
    ) as Record<CareerFieldId, number>;
    for (const c of CAREERS) map[c.field] += 1;
    return map;
  }, []);

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60">
            Career Library · {CAREERS.length} nghề
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Thư viện nghề nghiệp Việt Nam
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-white/60">
            Lọc theo <strong>lĩnh vực</strong> hoặc tìm kiếm — bấm thẻ để xem kỹ năng, lương và lộ
            trình chi tiết.
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

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/55">
          <Filter className="h-3.5 w-3.5" />
          Lọc theo lĩnh vực
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setField("all")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              field === "all"
                ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-[0_0_20px_-4px_rgba(34,211,238,0.5)]"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/8 dark:text-white/80 dark:hover:bg-white/12",
            )}
          >
            Tất cả ({CAREERS.length})
          </button>
          {CAREER_FIELD_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setField(id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                field === id
                  ? "bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-[0_0_20px_-4px_rgba(34,211,238,0.5)]"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/8 dark:text-white/80 dark:hover:bg-white/12",
              )}
            >
              {CAREER_FIELD_LABELS[id]} ({counts[id]})
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-white/50">
        {items.length} nghề
        {field !== "all" ? ` · ${CAREER_FIELD_LABELS[field]}` : ""}
        {q.trim() ? ` · từ khoá “${q.trim()}”` : ""}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((c) => (
          <CareerCard key={c.id} career={c} />
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-500">
          Không tìm thấy nghề phù hợp. Thử đổi bộ lọc hoặc từ khoá khác.
        </p>
      ) : null}
    </Container>
  );
}
