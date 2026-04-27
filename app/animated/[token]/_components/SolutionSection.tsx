"use client";

import { useEffect, useRef } from "react";
import type { ProposalCard } from "@/types/animated-proposal";
import { getIcon } from "@/lib/icon-map";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { Eyebrow } from "./_ui/Eyebrow";

interface Props {
  intro: string;
  solutions: ProposalCard[];
}

export function SolutionSection({ intro, solutions }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        const cards = sectionRef.current?.querySelectorAll(".solution-card");
        if (!cards) return;
        cards.forEach((card, i) => {
          gsap.fromTo(card, { x: MOTION.yFrom, opacity: 0 }, {
            x: 0, opacity: 1, duration: MOTION.base,
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
      <Eyebrow>The Solution</Eyebrow>
      <p className="text-xl md:text-2xl leading-relaxed max-w-2xl opacity-70 mb-10 md:mb-16">{intro}</p>

      <div className="grid md:grid-cols-3 gap-6">
        {solutions.map((solution, i) => {
          const Icon = getIcon(solution.icon_key);
          return (
            <div
              key={i}
              className="solution-card rounded-[var(--r-card-lg)] p-6 md:p-8 opacity-0"
              style={{
                border: "1px solid oklch(from var(--accent-2) l c h / 0.3)",
                background: "oklch(from var(--accent-2) l c h / 0.06)",
              }}
            >
              <Icon size={28} strokeWidth={1.5} className="mb-6" style={{ color: "var(--accent-2)" }} />
              <h3 className="text-base font-semibold mb-3 tracking-tight">{solution.title}</h3>
              <p className="text-sm leading-relaxed opacity-60">{solution.desc}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
