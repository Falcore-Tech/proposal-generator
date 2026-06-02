"use client";

import { useEffect, useRef } from "react";
import type { ProposalCard } from "@/types/animated-proposal";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { SectionHeader } from "./_ui/SectionHeader";
import { Heading } from "./_ui/Heading";
import { Text } from "./_ui/Text";

interface Props {
  problems: ProposalCard[];
}

export function ChallengeSection({ problems }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        const rows = sectionRef.current?.querySelectorAll(".challenge-row");
        if (!rows) return;
        rows.forEach((row) => {
          const numeral = row.querySelector(".challenge-numeral");
          const content = row.querySelector(".challenge-content");
          gsap.fromTo(numeral, { opacity: 0, x: -48 }, {
            opacity: 1, x: 0, duration: MOTION.slow, ease: MOTION.easeOut,
            scrollTrigger: { trigger: row, start: "top 88%" },
          });
          gsap.fromTo(content, { opacity: 0, y: MOTION.yFrom }, {
            opacity: 1, y: 0, duration: MOTION.base, ease: MOTION.easeOut,
            scrollTrigger: { trigger: row, start: "top 88%" },
          });
        });
      });
    });
  }, []);

  return (
    <Section
      ref={sectionRef}
      className="py-20 md:py-28"
      style={{
        background: "linear-gradient(to bottom, oklch(from var(--accent-danger) l c h / 0.06) 0%, transparent 45%)",
      }}
    >
      <SectionHeader
        eyebrow="The Challenge"
        title="What's slowing you down"
        description="The friction between where your pipeline sits today and where it should be."
      />

      <div className="mt-8 md:mt-12">
        {problems.map((problem, i) => (
          <div
            key={i}
            className="challenge-row flex flex-col md:flex-row items-start gap-4 md:gap-10 py-8 md:py-12 border-t border-border"
          >
            <Heading
              as="span"
              size="numeral"
              className="challenge-numeral select-none opacity-0"
              style={{
                color: "oklch(from var(--accent-danger) l c h)",
                marginTop: "-0.05em",
                minWidth: "3ch",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </Heading>
            <div className="challenge-content flex-1 pt-1 opacity-0">
              <Heading as="h3" size="h3" className="mb-3">
                {problem.title}
              </Heading>
              <Text variant="body" muted>{problem.desc}</Text>
            </div>
          </div>
        ))}
        <div className="border-t border-[color:var(--border)]" />
      </div>
    </Section>
  );
}
