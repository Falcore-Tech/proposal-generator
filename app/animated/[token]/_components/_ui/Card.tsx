import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  accentLeft?: boolean;
}

export function Card({ children, className, accent, accentLeft }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--r-card)] p-6 md:p-8",
        accentLeft
          ? "border-l-4 pl-6 md:pl-8 py-2"
          : "border border-[color:var(--border)]",
        className
      )}
      style={
        accent
          ? {
              border: "1px solid oklch(from var(--accent) l c h / 0.2)",
              background: "oklch(from var(--accent) l c h / 0.06)",
            }
          : accentLeft
            ? { borderColor: "var(--accent)" }
            : undefined
      }
    >
      {children}
    </div>
  );
}
