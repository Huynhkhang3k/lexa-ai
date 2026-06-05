"use client";

import { GraduationCap } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";
import { BINH_SON_LOGO_URL, SCHOOL_NAME } from "@/lib/brand";

type SchoolLogoProps = {
  size?: "sm" | "md";
  className?: string;
};

const sizes = {
  sm: { box: "h-10 w-10", px: 40 },
  md: { box: "h-12 w-12 sm:h-14 sm:w-14", px: 56 },
} as const;

export function SchoolLogo({ size = "md", className }: SchoolLogoProps) {
  const s = sizes[size];
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-cyan-400/15 dark:text-cyan-200",
          s.box,
          className,
        )}
        title={SCHOOL_NAME}
      >
        <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    );
  }

  return (
    <Image
      src={BINH_SON_LOGO_URL}
      alt={SCHOOL_NAME}
      width={s.px}
      height={s.px}
      priority
      unoptimized
      onError={() => setFailed(true)}
      className={cn(
        "shrink-0 rounded-full object-contain",
        s.box,
        className,
      )}
      style={{ background: "transparent" }}
    />
  );
}
