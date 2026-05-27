"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { CURRENCIES, CurrencyOption } from "@/lib/useCurrencyRates";

interface CurrencySelectorProps {
  selected: CurrencyOption;
  onChange: (currency: CurrencyOption) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selected,
  onChange,
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

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <span className="text-xs text-(--foreground)/50">Display in</span>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors bg-(--card) border border-(--primary)/30 text-(--foreground) hover:border-(--primary)"
      >
        <span className="font-medium">{selected.symbol !== selected.code ? `${selected.symbol} ` : ""}{selected.code}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-44 rounded-lg shadow-lg z-50 overflow-hidden bg-(--card) border border-(--primary)/20">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { onChange(c); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-(--primary)/10 ${selected.code === c.code ? "text-(--primary) font-semibold" : ""}`}
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
