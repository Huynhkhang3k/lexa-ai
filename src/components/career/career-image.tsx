import Image from "next/image";
import { getCareerImageUrl } from "@/lib/career-images";
import { cn } from "@/lib/utils";

type CareerImageProps = {
  careerId: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function CareerImage({
  careerId,
  alt,
  className,
  imageClassName,
  priority,
  sizes = "(max-width: 768px) 100vw, 480px",
}: CareerImageProps) {
  const src = getCareerImageUrl(careerId);
  if (!src) return null;

  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover object-center", imageClassName)}
      />
    </div>
  );
}
