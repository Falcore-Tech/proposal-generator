"use client";

import { useEffect, useRef } from "react";
import type { ProposalCard } from "@/types/animated-proposal";
import { getIcon } from "@/lib/icon-map";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { SectionHeader } from "./_ui/SectionHeader";
import { Heading } from "./_ui/Heading";
import { Text } from "./_ui/Text";

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
        cards.forEach((card) => {
          gsap.fromTo(card, { opacity: 0, y: MOTION.yFrom }, {
            opacity: 1, y: 0, duration: MOTION.base, ease: MOTION.easeOut,
            scrollTrigger: { trigger: card, start: MOTION.scrollStart },
          });
        });
      });
    });
  }, []);

  return (
    <Section ref={sectionRef} className="py-20 md:py-28">
      <SectionHeader eyebrow="The Solution" title="How we fix it" description={intro} />

      <div>
        {solutions.map((solution, i) => {
          const Icon = getIcon(solution.icon_key);
          return (
            <div
              key={i}
              className="solution-card opacity-0 py-8 md:py-10 border-t border-border"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-3">
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className="shrink-0"
                  style={{ color: "var(--accent-2)" }}
                />
                <Heading as="h3" size="h3">
                  {solution.title}
                </Heading>
              </div>
              <Text variant="body" muted className="md:pl-9">{solution.desc}</Text>
            </div>
          );
        })}
        <div className="border-t border-[color:var(--border)]" />
      </div>
    </Section>
  );
}
