import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface DividerProps {
  width?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { width = "3.5rem", className, style },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("h-px", className)}
      style={{
        width,
        background: "color-mix(in oklch, var(--fg) 30%, transparent)",
        ...style,
      }}
    />
  );
});

export { Divider };
