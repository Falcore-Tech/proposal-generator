import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin w-8 h-8 border-2 border-t-transparent rounded-full",
        className
      )}
      style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
    />
  );
}
