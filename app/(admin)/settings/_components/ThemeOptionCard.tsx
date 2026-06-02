"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThemeId } from "@/lib/proposal-themes";

interface Props {
  id: ThemeId;
  label: string;
  className: string;
  scheme: "light" | "dark";
  selected: boolean;
  onSelect: (id: ThemeId) => void;
}

export function ThemeOptionCard({ id, label, className, scheme, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border text-left transition-colors",
        selected
          ? "border-brand-primary ring-2 ring-brand-primary"
          : "border-border-primary hover:border-border-interactive"
      )}
    >
      <div
        className={cn("theme-animated", className, "relative h-32 w-full p-4")}
        style={{ background: "var(--bg)", color: "var(--fg)" }}
      >
        <div
          className="text-[0.6rem] uppercase tracking-[0.2em]"
          style={{ color: "color-mix(in oklch, var(--fg) 60%, transparent)" }}
        >
          Prepared for
        </div>
        <div
          className="mt-1 text-lg font-semibold leading-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Aa Bb Cc
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className="inline-flex h-5 items-center rounded-full px-3 text-[0.6rem] font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            Accept
          </span>
          <span className="h-3 w-3 rounded-full" style={{ background: "var(--accent-2)" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "var(--accent-warm)" }} />
        </div>
        {selected && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-brand-primary-foreground">
            <Check className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      <div className="flex items-center justify-between bg-surface-elevated px-4 py-3">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className="text-xs text-text-muted capitalize">{scheme}</span>
      </div>
    </button>
  );
}
