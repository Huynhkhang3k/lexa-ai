import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      id={id}
      className={cn(
        align === "center" ? "text-center" : "text-center sm:text-left",
        className,
      )}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-cyan-300">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-2 text-sm leading-6 text-slate-600 dark:text-white/60 sm:text-base",
            align === "center" && "mx-auto max-w-2xl",
            align === "left" && "max-w-2xl",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
