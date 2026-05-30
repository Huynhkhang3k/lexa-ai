"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { PROGRESS_METRICS } from "@/lib/landing-data";

export function ProgressDashboardSection() {
  const overall = Math.round(
    PROGRESS_METRICS.reduce((sum, m) => sum + m.value, 0) / PROGRESS_METRICS.length,
  );

  return (
    <section id="progress" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Lý do quay lại"
        title="Theo dõi hành trình phát triển"
        description="LEXA không phải công cụ dùng một lần — bạn theo dõi tiến độ, hoàn thiện từng mục tiêu và xây dựng tương lai theo thời gian."
      />

      <Card className="mt-8 overflow-hidden border-slate-200/80 dark:border-white/10">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-cyan-400/15">
              <BarChart3 className="h-5 w-5 text-sky-600 dark:text-cyan-300" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Bảng tiến độ cá nhân
              </div>
              <div className="text-xs text-slate-500 dark:text-white/50">
                Ví dụ minh hoạ — cập nhật theo hoạt động thực tế
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-sky-700 dark:text-cyan-300">{overall}%</div>
            <div className="text-[11px] text-slate-500 dark:text-white/50">Tổng tiến độ</div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
          {PROGRESS_METRICS.map((metric, i) => (
            <div key={metric.label}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="font-medium text-slate-800 dark:text-white/85">
                  {metric.label}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {metric.value}%
                </span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <motion.div
                  className={`h-full rounded-full ${metric.color}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${metric.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </CardContent>

        <div className="border-t border-slate-200/80 px-5 py-4 dark:border-white/10">
          <ButtonLink href="/test" className="justify-center sm:inline-flex">
            Bắt đầu theo dõi hành trình của bạn
          </ButtonLink>
        </div>
      </Card>
    </section>
  );
}
