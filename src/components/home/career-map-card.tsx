"use client";

import * as React from "react";
import { Loader2, Target } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGradeLevel } from "@/context/grade-level-context";
import {
  ALL_FEATURES,
  canGenerateCareerMap,
  EMPTY_MAP,
  FEATURE_LABELS,
  getActivityPayload,
  getCareerMap,
  getUsedFeatureCount,
  MIN_FEATURES_FOR_MAP,
  needsCareerMapAnalysis,
  saveCareerMap,
  type CareerMapData,
} from "@/lib/user-activity";
import { getHistorySummaryForAi } from "@/lib/user-history";

const ROWS: { key: keyof CareerMapData; label: string }[] = [
  { key: "traits", label: "Tố chất" },
  { key: "style", label: "Phong cách" },
  { key: "goal", label: "Mục tiêu" },
];

export function CareerMapCard() {
  const { gradeLevel } = useGradeLevel();
  const [map, setMap] = React.useState<CareerMapData>(EMPTY_MAP);
  const [usedCount, setUsedCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [hint, setHint] = React.useState("");

  const refresh = React.useCallback(() => {
    setUsedCount(getUsedFeatureCount());
    setMap(getCareerMap());
  }, []);

  React.useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("lexa-activity-updated", onUpdate);
    window.addEventListener("focus", onUpdate);
    return () => {
      window.removeEventListener("lexa-activity-updated", onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, [refresh]);

  React.useEffect(() => {
    if (!canGenerateCareerMap()) {
      const remaining = MIN_FEATURES_FOR_MAP - usedCount;
      const unused = ALL_FEATURES.filter(
        (f) => !getActivityPayload().featuresUsed.includes(f),
      );
      setHint(
        remaining > 0
          ? `Dùng thêm ${remaining} tính năng (${unused.map((f) => FEATURE_LABELS[f]).join(", ")}) để phân tích.`
          : "",
      );
      return;
    }

    if (!needsCareerMapAnalysis()) {
      setHint("Cập nhật khi bạn dùng thêm tính năng.");
      return;
    }

    let cancelled = false;

    async function analyze() {
      setLoading(true);
      setHint("Đang phân tích…");
      try {
        const payload = getActivityPayload();
        const res = await fetch("/api/career-map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            gradeLevel: gradeLevel ?? "thcs",
            historySummary: getHistorySummaryForAi(),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Không phân tích được");
        if (cancelled) return;
        saveCareerMap(data);
        setMap(data);
        setHint("Cập nhật khi bạn dùng thêm tính năng.");
      } catch {
        if (!cancelled) {
          setHint("Chưa phân tích được — thử lại sau.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    analyze();
    return () => {
      cancelled = true;
    };
  }, [usedCount, gradeLevel]);

  const locked = usedCount < MIN_FEATURES_FOR_MAP;

  function displayValue(key: keyof CareerMapData) {
    const val = map[key];
    if (locked || val === "Chưa phân tích" || val === "__") {
      return "—";
    }
    return val;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            Bản đồ nghề nghiệp
          </div>
          <div className="mt-1 text-sm text-slate-600 dark:text-white/60">
            Gợi ý ngành học theo sở thích & thế mạnh
          </div>
        </div>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-sky-600 dark:text-cyan-300" />
        ) : (
          <Target className="h-5 w-5 text-sky-600 dark:text-cyan-300" />
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-3">
          {ROWS.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 dark:border-white/8 dark:bg-white/5"
            >
              <span className="text-xs text-slate-500 dark:text-white/60">{row.label}</span>
              <span
                className={[
                  "text-right text-xs font-medium",
                  locked || map[row.key] === "__" || map[row.key] === "Chưa phân tích"
                    ? "text-slate-400 dark:text-white/35 italic"
                    : "text-slate-800 dark:text-white/80",
                ].join(" ")}
              >
                {displayValue(row.key)}
              </span>
            </div>
          ))}
        </div>
        {hint ? (
          <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-white/50">
            {hint}
            {locked ? (
              <span className="mt-1 block font-medium text-sky-700 dark:text-cyan-300/90">
                Đã dùng {usedCount}/{ALL_FEATURES.length} tính năng
              </span>
            ) : null}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
