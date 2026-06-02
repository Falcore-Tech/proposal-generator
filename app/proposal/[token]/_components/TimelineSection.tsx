"use client";

import { useEffect, useRef } from "react";
import type { TimelineNode } from "@/types/animated-proposal";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { SectionHeader } from "./_ui/SectionHeader";
import { Eyebrow } from "./_ui/Eyebrow";
import { Heading } from "./_ui/Heading";
import { Text } from "./_ui/Text";

interface Props {
  nodes: TimelineNode[];
  totalDays: number | null;
}

export function TimelineSection({ nodes, totalDays }: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const hLine = sectionRef.current?.querySelector(".tl-line-h");
        if (hLine) {
          gsap.fromTo(hLine, { scaleX: 0 }, {
            scaleX: 1, duration: 1.4, ease: MOTION.easeInOut,
            scrollTrigger: { trigger: sectionRef.current, start: MOTION.scrollStart },
          });
        }

        const vLine = sectionRef.current?.querySelector(".tl-line-v");
        if (vLine) {
          gsap.fromTo(vLine, { scaleY: 0 }, {
            scaleY: 1, duration: 1.4, ease: MOTION.easeInOut,
            scrollTrigger: { trigger: sectionRef.current, start: MOTION.scrollStart },
          });
        }

        const nodeEls = sectionRef.current?.querySelectorAll(".tl-node");
        nodeEls?.forEach((node, i) => {
          gsap.fromTo(node, { y: 24, opacity: 0 }, {
            y: 0, opacity: 1, duration: MOTION.base,
            delay: i * 0.18 + 0.5,
            ease: MOTION.easeOut,
            scrollTrigger: { trigger: sectionRef.current, start: MOTION.scrollStart },
          });
        });
      });
    });
  }, []);

  const linePct = `${100 / (2 * nodes.length)}%`;

  return (
    <Section ref={sectionRef} className="py-24 md:py-32">
      <SectionHeader
        eyebrow="Timeline"
        title="How it unfolds"
        description={
          totalDays
            ? `${totalDays} days from kickoff to a live pipeline.`
            : "From kickoff to a live, working pipeline."
        }
        className="mb-12 md:mb-16"
      />

      {/* Mobile: vertical */}
      <div className="md:hidden flex flex-col">
        {nodes.map((node, i) => (
          <div key={i} className="tl-node opacity-0 flex gap-5">
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-[var(--fs-caption)] shrink-0"
                style={{
                  borderColor: "var(--accent)",
                  background: "var(--bg)",
                  color: "var(--accent)",
                  zIndex: "var(--z-overlay)",
                }}
              >
                {i + 1}
              </div>
              {i < nodes.length - 1 && (
                <div
                  className="w-px flex-1 mt-1 min-h-8"
                  style={{ background: `linear-gradient(to bottom, var(--accent), oklch(from var(--accent) l c h / 0.2))` }}
                />
              )}
            </div>
            <div className="pb-8 pt-2">
              <Heading as="p" size="h3" className="mb-1">{node.label}</Heading>
              <Eyebrow className="mb-2 opacity-40">Day {node.days}</Eyebrow>
              <Text variant="caption" muted>{node.desc}</Text>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: horizontal */}
      <div className="hidden md:flex relative items-start gap-0">
        <div
          className="tl-line-h absolute h-px origin-left pointer-events-none"
          style={{
            top: "1.5rem",
            left: linePct,
            right: linePct,
            background: `linear-gradient(to right, var(--accent), oklch(from var(--accent) l c h / 0.25))`,
          }}
        />
        {nodes.map((node, i) => (
          <div key={i} className="tl-node flex-1 flex flex-col items-center gap-0 opacity-0">
            <div
              className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-[var(--fs-caption)] shrink-0 mb-6 relative"
              style={{
                borderColor: "var(--accent)",
                background: "var(--bg)",
                color: "var(--accent)",
                zIndex: "var(--z-overlay)",
              }}
            >
              {i + 1}
            </div>
            <div className="text-center px-3">
              <Heading as="p" size="h3" className="mb-1">{node.label}</Heading>
              <Eyebrow className="mb-3 opacity-40">Day {node.days}</Eyebrow>
              <Text variant="caption" muted>{node.desc}</Text>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
