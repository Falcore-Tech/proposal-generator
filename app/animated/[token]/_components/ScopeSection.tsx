"use client";

import { useEffect, useRef, useState } from "react";
import type { ScopeItem } from "@/types/animated-proposal";
import { getIcon } from "@/lib/icon-map";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { Eyebrow } from "./_ui/Eyebrow";

interface Props {
  phaseName: string | null;
  subtitle: string | null;
  items: ScopeItem[];
}

export function ScopeSection({ phaseName, subtitle, items }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [deliveredCount] = useState(0);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        const cards = sectionRef.current?.querySelectorAll(".scope-item");
        if (!cards) return;
        cards.forEach((card, i) => {
          gsap.fromTo(card, { y: MOTION.yFrom, opacity: 0 }, {
            y: 0, opacity: 1, duration: MOTION.base,
            delay: i * MOTION.stagger,
            ease: MOTION.easeOut,
            scrollTrigger: { trigger: card, start: MOTION.scrollStart },
          });
        });
      });
    });
  }, []);

  return (
    <Section ref={sectionRef} className="py-20 md:py-28">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-4 gap-4">
        <div>
          <Eyebrow>Scope of Work</Eyebrow>
          <h2 className="text-[var(--fs-h2)] font-semibold" style={{ letterSpacing: "var(--tracking-tight)" }}>
            {phaseName ?? "What We Build"}
          </h2>
          {subtitle && <p className="mt-2 opacity-55">{subtitle}</p>}
        </div>
        <div className="text-left md:text-right">
          <span className="text-4xl font-black tabular-nums" style={{ color: "var(--accent)" }}>
            {deliveredCount}
          </span>
          <span className="text-lg opacity-40"> of {items.length} Delivered</span>
        </div>
      </div>

      <div className="w-full h-px mb-10 md:mb-16 opacity-15" style={{ background: "var(--accent)" }} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item, i) => {
          const Icon = getIcon(item.icon_key);
          return (
            <div
              key={i}
              className="scope-item border border-[color:var(--border)] rounded-[var(--r-card)] p-6 opacity-0 hover:border-[color:var(--border-strong)] transition-colors"
            >
              <Icon size={22} strokeWidth={1.5} className="mb-4 opacity-60" style={{ color: "var(--accent)" }} />
              <h4 className="font-semibold mb-2 text-sm tracking-tight">{item.title}</h4>
              <p className="text-xs leading-relaxed opacity-55">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
