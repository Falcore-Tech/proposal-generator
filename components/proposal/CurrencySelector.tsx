"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { CURRENCIES, CurrencyOption } from "@/lib/useCurrencyRates";

interface CurrencySelectorProps {
  selected: CurrencyOption;
  onChange: (currency: CurrencyOption) => void;
  isXmaMedia?: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selected,
  onChange,
  isXmaMedia = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const triggerBg = isXmaMedia
    ? "bg-(--card) border border-(--primary)/30 text-(--foreground) hover:border-(--primary)"
    : "bg-zinc-800 border border-zinc-700 text-white hover:border-zinc-500";
  const dropdownBg = isXmaMedia
    ? "bg-(--card) border border-(--primary)/20"
    : "bg-zinc-800 border border-zinc-700";
  const itemHover = isXmaMedia
    ? "hover:bg-(--primary)/10"
    : "hover:bg-zinc-700";
  const itemActive = isXmaMedia
    ? "text-(--primary) font-semibold"
    : "text-red-400 font-semibold";
  const labelColor = isXmaMedia
    ? "text-(--foreground)/50"
    : "text-zinc-400";

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <span className={`text-xs ${labelColor}`}>Display in</span>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${triggerBg}`}
      >
        <span className="font-medium">{selected.symbol !== selected.code ? `${selected.symbol} ` : ""}{selected.code}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`absolute top-full right-0 mt-1 w-44 rounded-lg shadow-lg z-50 overflow-hidden ${dropdownBg}`}>
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { onChange(c); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${itemHover} ${selected.code === c.code ? itemActive : ""}`}
            >
              <span>{c.label}</span>
              <span className="opacity-60 text-xs">{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
