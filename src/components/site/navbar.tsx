"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Languages,
  Menu,
  MessageCircle,
  PenLine,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Button, ButtonLink } from "@/components/ui/button";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { useGradeLevel, gradeLevelLabel } from "@/context/grade-level-context";

const navItems = [
  { href: "/test", label: "Bài test", icon: ClipboardList },
  { href: "/library", label: "Thư viện nghề", icon: BookOpen },
  { href: "/translate", label: "Dịch thuật", icon: Languages },
  { href: "/chat", label: "Trợ lý học", icon: MessageCircle },
  { href: "/practice", label: "Luyện tập", icon: PenLine },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { gradeLevel, openPicker } = useGradeLevel();

  return (
    <header className="sticky top-0 z-50">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-20",
          "bg-gradient-to-b from-white/92 via-white/65 to-transparent backdrop-blur-sm",
          "dark:from-black/80 dark:via-black/45 dark:to-transparent",
        )}
      />
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-16 border-b backdrop-blur-xl sm:h-[4.25rem]",
          "border-slate-200/70 bg-gradient-to-r from-white/90 via-slate-50/85 to-white/90",
          "shadow-[0_1px_0_0_rgba(14,165,233,0.14),0_4px_20px_-6px_rgba(15,23,42,0.1),0_12px_40px_-14px_rgba(14,165,233,0.16)]",
          "dark:border-cyan-500/20 dark:from-[#0a0b14]/92 dark:via-[#0d0e1a]/90 dark:to-[#0a0b14]/92",
          "dark:shadow-[0_1px_0_0_rgba(34,211,238,0.22),0_8px_28px_-10px_rgba(0,0,0,0.45),0_16px_48px_-18px_rgba(168,85,247,0.22)]",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-20",
          "bg-[radial-gradient(ellipse_75%_70%_at_12%_0%,rgba(14,165,233,0.07),transparent_52%)]",
          "dark:bg-[radial-gradient(ellipse_75%_70%_at_12%_0%,rgba(34,211,238,0.12),transparent_52%)]",
        )}
      />
      <Container className="relative">
        <div className="flex h-16 items-center justify-between gap-2 sm:h-[4.25rem]">
          <Logo size="sm" className="min-w-0 max-w-[58%] sm:hidden" />
          <Logo size="md" className="hidden min-w-0 sm:inline-flex" />

          <nav className="hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-slate-900/5 text-slate-900 shadow-sm dark:bg-white/10 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                      : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-white/65 dark:hover:bg-white/8 dark:hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {gradeLevel ? (
              <button
                type="button"
                onClick={openPicker}
                className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 sm:inline-flex dark:border-white/12 dark:bg-white/8 dark:text-white/80 dark:hover:border-cyan-400/40"
                title="Đổi khối lớp"
              >
                <GraduationCap className="h-3.5 w-3.5 text-sky-600 dark:text-cyan-300" />
                {gradeLevelLabel(gradeLevel)}
              </button>
            ) : null}
            <ThemeToggle />
            <ButtonLink
              href="/test"
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Bắt đầu ngay
            </ButtonLink>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {open ? (
          <div className="pb-3 md:hidden">
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-black/50 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div className="flex flex-col">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                        active
                          ? "bg-slate-100 text-slate-900 dark:bg-white/8 dark:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/75 dark:hover:text-white dark:hover:bg-white/6",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80" />
                      {item.label}
                    </Link>
                  );
                })}
                <div className="px-2 py-2">
                  <ButtonLink href="/test" className="w-full" size="md">
                    Bắt đầu ngay
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
