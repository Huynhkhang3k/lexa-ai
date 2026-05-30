import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CommonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<NonNullable<CommonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-cyan-400/90 via-blue-500/90 to-fuchsia-500/90 text-black shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_12px_50px_-12px_rgba(34,211,238,0.45)] hover:brightness-110 active:brightness-95",
  secondary:
    "border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 dark:border-transparent dark:bg-white/8 dark:text-white dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] dark:hover:bg-white/12",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-white/80 dark:hover:bg-white/6 dark:hover:text-white",
};

const sizes: Record<NonNullable<CommonProps["size"]>, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & CommonProps,
) {
  const { className, variant = "primary", size = "md", ...rest } = props;
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  );
}

export function ButtonLink(
  props: React.ComponentProps<typeof Link> & CommonProps,
) {
  const { className, variant = "primary", size = "md", ...rest } = props;
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    />
  );
}

