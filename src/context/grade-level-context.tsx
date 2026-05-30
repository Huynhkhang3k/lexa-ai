"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import {
  GRADE_LEVELS,
  GRADE_LEVEL_STORAGE_KEY,
  type GradeLevelId,
  gradeLevelLabel,
  isValidGradeLevel,
} from "@/lib/grade-level";

type GradeLevelContextValue = {
  gradeLevel: GradeLevelId | null;
  ready: boolean;
  setGradeLevel: (id: GradeLevelId) => void;
  openPicker: () => void;
};

const GradeLevelContext = React.createContext<GradeLevelContextValue | null>(null);

export function useGradeLevel() {
  const ctx = React.useContext(GradeLevelContext);
  if (!ctx) {
    throw new Error("useGradeLevel must be used within GradeLevelProvider");
  }
  return ctx;
}

function GradeLevelModal({
  open,
  onSelect,
}: {
  open: boolean;
  onSelect: (id: GradeLevelId) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm dark:bg-black/70" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="grade-level-title"
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0d0e1a]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 dark:bg-cyan-400/15">
            <GraduationCap className="h-6 w-6 text-sky-600 dark:text-cyan-300" />
          </div>
          <div>
            <h2
              id="grade-level-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              Bạn đang học khối nào?
            </h2>
            <p className="text-sm text-slate-600 dark:text-white/60">
              LEXA AI sẽ điều chỉnh bài test, dịch thuật, trợ lý học và luyện tập cho phù hợp.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {GRADE_LEVELS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelect(g.id)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-left transition hover:border-sky-400 hover:bg-sky-50 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-400/10"
            >
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {g.label}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-white/55">{g.hint}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GradeLevelProvider({ children }: { children: React.ReactNode }) {
  const [gradeLevel, setGradeLevelState] = React.useState<GradeLevelId | null>(null);
  const [ready, setReady] = React.useState(false);
  const [forceOpen, setForceOpen] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem(GRADE_LEVEL_STORAGE_KEY);
    if (isValidGradeLevel(stored)) {
      setGradeLevelState(stored);
    }
    setReady(true);
  }, []);

  function setGradeLevel(id: GradeLevelId) {
    setGradeLevelState(id);
    localStorage.setItem(GRADE_LEVEL_STORAGE_KEY, id);
    setForceOpen(false);
  }

  const showModal = ready && (!gradeLevel || forceOpen);

  return (
    <GradeLevelContext.Provider
      value={{
        gradeLevel,
        ready,
        setGradeLevel,
        openPicker: () => setForceOpen(true),
      }}
    >
      {children}
      <GradeLevelModal open={showModal} onSelect={setGradeLevel} />
    </GradeLevelContext.Provider>
  );
}

export { gradeLevelLabel };
