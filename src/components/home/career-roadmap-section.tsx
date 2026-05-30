"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Flag, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { CAREER_ROADMAP_DEMO } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

export function CareerRoadmapSection() {
  const { goal, goalVi, steps } = CAREER_ROADMAP_DEMO;

  return (
    <section id="roadmap" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Tính năng nổi bật"
        title="AI Career Roadmap"
        description="Chọn mục tiêu nghề nghiệp — LEXA vẽ lộ trình từng bước, từ lớp học hiện tại đến công việc mơ ước."
        align="center"
      />

      <div className="relative mt-10 overflow-hidden rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-50/90 via-white to-violet-50/60 p-6 shadow-lg dark:border-cyan-500/25 dark:from-cyan-500/[0.08] dark:via-[#0a0b14] dark:to-fuchsia-500/[0.06] sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl dark:bg-cyan-400/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl dark:bg-fuchsia-500/10" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm dark:border-cyan-400/25 dark:bg-white/10 dark:text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-300" />
            Mục tiêu nghề nghiệp
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {goal}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/60">{goalVi}</p>
        </div>

        <div className="relative mx-auto mt-10 max-w-xl">
          <div className="absolute bottom-4 left-1/2 top-4 w-px -translate-x-1/2 bg-gradient-to-b from-sky-400/60 via-violet-400/50 to-fuchsia-500/60 dark:from-cyan-400/40 dark:via-fuchsia-400/30 dark:to-fuchsia-500/50" />

          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={`${step.grade}-${i}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="relative flex justify-center"
              >
                <div
                  className={cn(
                    "relative z-[1] w-full max-w-md rounded-2xl border px-4 py-3 shadow-sm transition",
                    "isGoal" in step && step.isGoal
                      ? "border-fuchsia-300/70 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md dark:border-fuchsia-400/40"
                      : "border-slate-200/80 bg-white/95 dark:border-white/12 dark:bg-white/[0.06]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        "isGoal" in step && step.isGoal
                          ? "bg-white/20 text-white"
                          : "bg-sky-100 text-sky-700 dark:bg-cyan-400/15 dark:text-cyan-200",
                      )}
                    >
                      {"isGoal" in step && step.isGoal ? (
                        <Flag className="h-4 w-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <div
                        className={cn(
                          "text-sm font-semibold",
                          "isGoal" in step && step.isGoal
                            ? "text-white"
                            : "text-slate-900 dark:text-white",
                        )}
                      >
                        {step.grade}
                      </div>
                      <div
                        className={cn(
                          "text-xs",
                          "isGoal" in step && step.isGoal
                            ? "text-white/85"
                            : "text-slate-500 dark:text-white/55",
                        )}
                      >
                        {step.focus}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <ArrowDown className="h-5 w-5 animate-bounce text-sky-500/60 dark:text-cyan-400/50" />
          </div>
        </div>

        <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/test" size="lg" className="justify-center">
            Tạo lộ trình của bạn
          </ButtonLink>
          <ButtonLink href="/library" variant="secondary" size="lg" className="justify-center">
            Khám phá thư viện nghề
          </ButtonLink>
        </div>

        <p className="relative mt-4 text-center text-xs text-slate-500 dark:text-white/45">
          Ví dụ minh hoạ — lộ trình thực tế được cá nhân hoá sau bài test và hoạt động trên LEXA.
        </p>
      </div>
    </section>
  );
}
