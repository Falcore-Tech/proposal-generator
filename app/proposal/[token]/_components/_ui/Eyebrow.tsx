import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  style?: React.CSSProperties;
}

const Eyebrow = forwardRef<HTMLParagraphElement, EyebrowProps>(function Eyebrow(
  { children, className, accent, style },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn(
        "text-[var(--fs-eyebrow)] tracking-[var(--tracking-eyebrow)] uppercase font-medium mb-4",
        accent ? "opacity-100" : "opacity-50",
        className
      )}
      style={accent ? { color: "var(--accent)", ...style } : style}
    >
      {children}
    </p>
  );
});

export { Eyebrow };
