import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function BrandBadge({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest",
        "bg-(--brand-accent) text-(--brand-accent-fg)",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
