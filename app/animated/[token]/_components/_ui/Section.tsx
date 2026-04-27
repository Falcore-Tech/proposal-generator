import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  narrow?: boolean;
  tone?: "default" | "muted" | "accent-wash";
}

const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { children, className, narrow, tone = "default", style, ...props },
  ref
) {
  const toneStyle =
    tone === "accent-wash"
      ? { background: "oklch(from var(--accent) l c h / 0.04)", ...style }
      : style;

  return (
    <section
      ref={ref}
      style={toneStyle}
      className={cn(
        "px-6 md:px-16 lg:px-24 py-16 md:py-24",
        tone === "muted" && "bg-(--muted)",
        className
      )}
      {...props}
    >
      <div className={cn("mx-auto", narrow ? "max-w-[52rem]" : "max-w-6xl")}>
        {children}
      </div>
    </section>
  );
});

export { Section };
