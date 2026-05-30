"use client";

import { BookOpen, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HubTab } from "@/components/language-hub/types";

const tabs: { id: HubTab; label: string; icon: typeof Languages }[] = [
  { id: "translator", label: "AI Dịch thuật", icon: Languages },
  { id: "dictionary", label: "Từ điển AI", icon: BookOpen },
];

type Props = {
  active: HubTab;
  onChange: (tab: HubTab) => void;
};

export function LanguageTabs({ active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="AI Dịch thuật"
      className="inline-flex flex-wrap gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/80 p-1 dark:border-white/10 dark:bg-white/[0.06]"
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-white text-slate-900 shadow-sm dark:bg-white/12 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                : "text-slate-600 hover:text-slate-900 dark:text-white/65 dark:hover:text-white",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
