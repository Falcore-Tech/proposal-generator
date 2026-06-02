"use client";

import { useEffect, useRef } from "react";
import type { ScopeItem } from "@/types/animated-proposal";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { SectionHeader } from "./_ui/SectionHeader";
import { Heading } from "./_ui/Heading";
import { Text } from "./_ui/Text";

interface Props {
  phaseName: string | null;
  subtitle: string | null;
  items: ScopeItem[];
}

export function ScopeSection({ phaseName, subtitle, items }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        const rows = sectionRef.current?.querySelectorAll(".scope-row");
        if (!rows) return;
        rows.forEach((row) => {
          gsap.fromTo(row, { opacity: 0, y: MOTION.yFrom }, {
            opacity: 1, y: 0, duration: MOTION.base, ease: MOTION.easeOut,
            scrollTrigger: { trigger: row, start: "top 90%" },
          });
        });
      });
    });
  }, []);

  return (
    <Section ref={sectionRef} className="py-20 md:py-28">
      <SectionHeader
        eyebrow="Scope of Work"
        title={phaseName ?? "What We Build"}
        description={subtitle}
      />

      <dl>
        {items.map((item, i) => (
          <div
            key={i}
            className="scope-row opacity-0 flex flex-col md:flex-row items-start gap-4 py-7 md:py-9 border-t border-border"
          >
            <dt className="shrink-0" style={{ minWidth: "2.5rem" }}>
              <Heading
                as="span"
                size="numeral-sm"
                className="tabular-nums select-none"
                style={{ color: "var(--accent)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </Heading>
            </dt>
            <dd className="flex-1">
              <Heading as="h4" size="h3" className="mb-2">
                {item.title}
              </Heading>
              <Text variant="caption" muted>{item.desc}</Text>
            </dd>
          </div>
        ))}
        <div className="border-t border-[color:var(--border)]" />
      </dl>
    </Section>
  );
}
