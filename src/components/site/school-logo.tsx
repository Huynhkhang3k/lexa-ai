import Image from "next/image";
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

  return (
    <Image
      src={BINH_SON_LOGO_URL}
      alt={SCHOOL_NAME}
      width={s.px}
      height={s.px}
      priority
      unoptimized
      className={cn(
        "shrink-0 object-contain bg-transparent",
        s.box,
        className,
      )}
    />
  );
}
