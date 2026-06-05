import Image from "next/image";
import { cn } from "@/lib/utils";

type RiasecGroupImageProps = {
  src: string;
  alt: string;
  compact?: boolean;
  className?: string;
};

/** Ảnh nhóm Holland 228×250 — object-contain để không cắt chữ/icon trên ảnh. */
export function RiasecGroupImage({ src, alt, compact, className }: RiasecGroupImageProps) {
  return (
    <div
      className={cn(
        "relative flex w-full shrink-0 items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/80 dark:from-white/[0.06] dark:to-white/[0.02]",
        compact ? "min-h-[132px]" : "min-h-[200px] sm:min-h-[220px]",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={228}
        height={250}
        unoptimized
        className="h-auto max-h-full w-full max-w-[228px] object-contain object-center px-2 py-2"
        style={{ aspectRatio: "228 / 250" }}
      />
    </div>
  );
}
