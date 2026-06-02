"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { THEMES, THEME_STORAGE_KEY, type ThemeId } from "./_lib/themes";

interface Props {
  activeId: ThemeId;
  onSelect: (id: ThemeId) => void;
}

export function ThemeSwitcher({ activeId, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  function choose(id: ThemeId) {
    onSelect(id);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {}
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
      {open && (
        <div
          className="flex flex-col gap-1 rounded-[var(--r-card)] border p-2 shadow-lg backdrop-blur-md"
          style={{
            background: "color-mix(in oklch, var(--bg) 88%, transparent)",
            borderColor: "var(--border-strong)",
            color: "var(--fg)",
          }}
        >
          {THEMES.map((theme) => {
            const isActive = theme.id === activeId;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => choose(theme.id)}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--r-chip)] px-3 py-2 text-left text-sm font-medium transition-colors",
                  isActive ? "bg-current/10" : "hover:bg-current/5"
                )}
              >
                <span
                  className={cn("h-4 w-4 shrink-0 rounded-full border", "theme-animated", theme.className)}
                  style={{ background: "var(--accent)", borderColor: "var(--border-strong)" }}
                />
                <span className="whitespace-nowrap">{theme.label}</span>
                {isActive && (
                  <span className="ml-auto text-xs" style={{ color: "var(--accent)" }}>
                    ●
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch theme"
        className="flex items-center gap-2 rounded-[var(--r-pill)] border px-4 py-2 text-sm font-bold shadow-lg backdrop-blur-md transition-colors hover:bg-current/5"
        style={{
          background: "color-mix(in oklch, var(--bg) 88%, transparent)",
          borderColor: "var(--border-strong)",
          color: "var(--fg)",
        }}
      >
        <span
          className="h-3.5 w-3.5 rounded-full"
          style={{ background: "var(--accent)" }}
        />
        Theme
      </button>
    </div>
  );
}
