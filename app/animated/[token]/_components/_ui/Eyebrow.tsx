import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}

export function Eyebrow({ children, className, accent }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-xs tracking-[0.25em] uppercase font-medium mb-4",
        accent ? "opacity-100" : "opacity-50",
        className
      )}
      style={accent ? { color: "var(--accent)" } : undefined}
    >
      {children}
    </p>
  );
}
