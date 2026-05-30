"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { LEXA_JOURNEY } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" as const },
  }),
};

export function JourneySection() {
  return (
    <section id="journey" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Bắt đầu từ đâu?"
        title="Hành trình cùng LEXA"
        description="Không cần đoán — LEXA dẫn bạn từng bước, từ khám phá bản thân đến xây dựng tương lai. Mỗi bước mở ra bước tiếp theo."
      />

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-sky-200/70 bg-sky-50/80 px-4 py-3 dark:border-cyan-400/20 dark:bg-cyan-400/10">
          <span className="rounded-full bg-sky-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white dark:bg-cyan-500">
            Bắt đầu tại đây
          </span>
          <span className="text-sm text-slate-700 dark:text-white/80">
            Bước 1: Làm bài test khám phá bản thân — mất khoảng 10 phút
          </span>
        </div>

        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute left-0 right-0 top-5 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent dark:via-cyan-400/30" />
            <div className="grid grid-cols-7 gap-2">
              {LEXA_JOURNEY.map((step, i) => (
                <motion.div
                  key={step.label}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={fadeUp}
                  className="relative flex flex-col items-center text-center"
                >
                  <div
                    className={cn(
                      "relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold shadow-sm",
                      i === 0
                        ? "border-sky-500 bg-sky-600 text-white dark:border-cyan-400 dark:bg-cyan-500"
                        : "border-sky-300/60 bg-white text-sky-700 dark:border-cyan-400/40 dark:bg-[#0d0e1a] dark:text-cyan-200",
                    )}
                  >
                    {i + 1}
                  </div>
                  <step.icon className="mt-3 h-4 w-4 text-sky-600 dark:text-cyan-300" />
                  <p className="mt-2 text-xs font-semibold leading-snug text-slate-900 dark:text-white">
                    {step.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500 dark:text-white/50">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 lg:hidden">
          {LEXA_JOURNEY.map((step, i) => (
            <motion.div
              key={step.label}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                    i === 0
                      ? "bg-sky-600 text-white dark:bg-cyan-500"
                      : "bg-white text-sky-700 dark:bg-white/10 dark:text-cyan-200",
                  )}
                >
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <step.icon className="h-4 w-4 text-sky-600 dark:text-cyan-300" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {step.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-white/60">{step.desc}</p>
                  {step.href ? (
                    <Link
                      href={step.href}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-700 dark:text-cyan-300"
                    >
                      Bắt đầu <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
