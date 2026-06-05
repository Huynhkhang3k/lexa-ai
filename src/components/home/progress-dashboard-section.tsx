"use client";

import * as React from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "./section-heading";
import { computeProgressMetrics, type ProgressMetric } from "@/lib/user-profile";

const EMPTY_METRICS: ProgressMetric[] = [
  { label: "Đánh giá bản thân", value: 0, color: "bg-sky-500" },
  { label: "Khám phá nghề nghiệp", value: 0, color: "bg-violet-500" },
  { label: "Kỹ năng cần học", value: 0, color: "bg-fuchsia-500" },
  { label: "Mục tiêu nghề nghiệp", value: 0, color: "bg-blue-500" },
];

export function ProgressDashboardSection() {
  const [metrics, setMetrics] = React.useState(EMPTY_METRICS);

  React.useEffect(() => {
    const refresh = () => setMetrics(computeProgressMetrics());
    refresh();
    window.addEventListener("lexa-profile-updated", refresh);
    window.addEventListener("lexa-activity-updated", refresh);
    return () => {
      window.removeEventListener("lexa-profile-updated", refresh);
      window.removeEventListener("lexa-activity-updated", refresh);
    };
  }, []);

  const overall = Math.round(metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length);
  const isEmpty = overall === 0;

  if (isEmpty) {
    return null;
  }

  return (
    <section id="progress" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Theo dõi tiến trình"
        title="Hành trình phát triển của bạn"
        description="Tiến độ tính từ đánh giá, khám phá nghề, luyện tập và mục tiêu bạn thiết lập."
      />

      <Card className="mt-8 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-sky-600 dark:text-cyan-300" />
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Bảng tiến độ cá nhân
            </div>
          </div>
          {!isEmpty ? (
            <div className="text-2xl font-bold text-sky-700 dark:text-cyan-300">{overall}%</div>
          ) : null}
        </CardHeader>

        <CardContent className="p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{metric.label}</span>
                  <span className="font-semibold">{metric.value}%</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full ${metric.color}`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
