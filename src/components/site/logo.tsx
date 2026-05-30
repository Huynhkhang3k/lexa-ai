import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LEXA_LOGO_URL } from "@/lib/brand";

type LogoProps = {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md";
};

const sizes = {
  sm: { px: 116, overlap: 28, title: "text-base sm:text-lg", sub: "text-[8px] sm:text-[9px]" },
  md: { px: 148, overlap: 36, title: "text-base sm:text-lg md:text-xl", sub: "text-[8px] sm:text-[9px]" },
} as const;

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const s = sizes[size];

  return (
    <Link
      href="/"
      className={cn(
        "group relative inline-flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.015] active:scale-[0.99]",
        className,
      )}
      aria-label="LEXA AI"
    >
      <span className="relative inline-flex items-center">
        {/* Subtle highlight — small, tight to the mark */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[18%] top-1/2 z-0 h-[42%] w-[42%] -translate-y-1/2 rounded-full bg-cyan-400/15 blur-md dark:bg-cyan-400/20"
        />

        <Image
          src={LEXA_LOGO_URL}
          alt=""
          width={s.px * 2}
          height={s.px * 2}
          quality={100}
          priority
          unoptimized
          className={cn(
            "brand-logo-crisp relative z-[1] block object-contain",
            "drop-shadow-[0_1px_3px_rgba(0,0,0,0.12)]",
            "transition duration-300 group-hover:drop-shadow-[0_2px_8px_rgba(34,211,238,0.22)]",
          )}
          style={{ width: s.px, height: s.px, maxWidth: "none" }}
        />

        {showText ? (
          <span
            className="relative z-[2] flex flex-col justify-center leading-none"
            style={{ marginLeft: -s.overlap }}
          >
            <span
              className={cn(
                "whitespace-nowrap bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text font-bold tracking-tight text-transparent",
                "dark:from-white dark:via-cyan-50 dark:to-white",
                s.title,
              )}
            >
              LEXA AI
            </span>
            <span
              className={cn(
                "mt-1 whitespace-nowrap font-medium uppercase tracking-[0.32em] text-slate-500/90",
                "dark:text-cyan-200/55",
                s.sub,
              )}
            >
              HỆ SINH THÁI
            </span>
          </span>
        ) : null}
      </span>
    </Link>
  );
}
