"use client";

import { useEffect, useRef } from "react";
import type { ProposalCard } from "@/types/animated-proposal";
import { getIcon } from "@/lib/icon-map";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { Eyebrow } from "./_ui/Eyebrow";

interface Props {
  problems: ProposalCard[];
}

export function ChallengeSection({ problems }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        const cards = sectionRef.current?.querySelectorAll(".challenge-card");
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
    <Section ref={sectionRef} tone="accent-wash" className="py-20 md:py-28">
      <Eyebrow accent>The Challenge</Eyebrow>

      <div className="grid md:grid-cols-3 gap-6 mt-6 md:mt-10">
        {problems.map((problem, i) => {
          const Icon = getIcon(problem.icon_key);
          return (
            <div
              key={i}
              className="challenge-card rounded-[var(--r-card-lg)] p-6 md:p-8 opacity-0"
              style={{
                border: "1px solid oklch(from var(--accent-danger) l c h / 0.2)",
                background: "oklch(from var(--accent-danger) l c h / 0.06)",
              }}
            >
              <Icon size={28} strokeWidth={1.5} className="mb-6" style={{ color: "var(--accent-danger)" }} />
              <h3 className="text-base font-semibold mb-3 tracking-tight">{problem.title}</h3>
              <p className="text-sm leading-relaxed opacity-60">{problem.desc}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
