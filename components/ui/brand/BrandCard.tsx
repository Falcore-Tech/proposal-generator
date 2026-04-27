import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function BrandCard({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-(--brand-border) bg-(--brand-muted) p-6 transition-shadow hover:shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
