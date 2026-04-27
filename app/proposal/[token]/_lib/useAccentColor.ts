"use client";

import { useEffect, useRef, useState } from "react";

export function useAccentColor(fallback = "oklch(0.577 0.245 27.325)") {
  const ref = useRef<HTMLElement>(null);
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const el = ref.current ?? document.body;
    const v = getComputedStyle(el).getPropertyValue("--accent").trim();
    if (v) setColor(v);
  }, []);

  return [color, ref] as const;
}
