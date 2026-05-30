"use client";

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { GRADE_LEVELS, type GradeLevelId } from "@/lib/grade-level";

type Props = {
  value: GradeLevelId | null;
  onChange: (id: GradeLevelId) => void;
  compact?: boolean;
  required?: boolean;
  error?: string | null;
};

export function GradeLevelPicker({ value, onChange, compact, required, error }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white/80">
        <GraduationCap className="h-4 w-4 text-sky-600 dark:text-cyan-300" />
        Khối lớp / độ tuổi
        {required ? <span className="text-red-500">*</span> : null}
      </div>
      <div className={cn("grid gap-2", compact ? "grid-cols-3" : "gap-3 sm:grid-cols-3")}>
        {GRADE_LEVELS.map((g) => {
          const selected = value === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onChange(g.id)}
              className={cn(
                "rounded-xl border px-3 py-3 text-left transition",
                compact ? "py-2.5" : "py-4",
                selected
                  ? "border-sky-400 bg-sky-50 ring-1 ring-sky-400/40 dark:border-cyan-400/50 dark:bg-cyan-400/10"
                  : "border-slate-200 bg-slate-50 hover:border-sky-300 dark:border-white/10 dark:bg-white/5",
              )}
            >
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{g.label}</div>
              <div className="text-xs text-slate-500 dark:text-white/55">{g.hint}</div>
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs text-red-600 dark:text-red-300">{error}</p> : null}
    </div>
  );
}
