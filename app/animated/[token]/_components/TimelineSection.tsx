"use client";

import { useEffect, useRef } from "react";
import type { TimelineNode } from "@/types/animated-proposal";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { Eyebrow } from "./_ui/Eyebrow";

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

        const line = sectionRef.current?.querySelector(".tl-line");
        if (line) {
          gsap.fromTo(line, { scaleX: 0 }, {
            scaleX: 1, duration: 1.2, ease: MOTION.easeInOut,
            scrollTrigger: { trigger: sectionRef.current, start: MOTION.scrollStart },
          });
        }

        const nodeEls = sectionRef.current?.querySelectorAll(".tl-node");
        nodeEls?.forEach((node, i) => {
          gsap.fromTo(node, { y: 20, opacity: 0 }, {
            y: 0, opacity: 1, duration: MOTION.fast,
            delay: i * 0.15 + 0.4,
            ease: MOTION.easeOut,
            scrollTrigger: { trigger: sectionRef.current, start: MOTION.scrollStart },
          });
        });
      });
    });
  }, []);

  const linePct = `${100 / (2 * nodes.length)}%`;

  return (
    <Section ref={sectionRef}>
      <Eyebrow>Timeline</Eyebrow>
      <p className="text-xl md:text-2xl opacity-80 mb-10 md:mb-16">
        {totalDays ? `${totalDays} business days from kickoff.` : "Project timeline at a glance."}
      </p>

      <div className="relative flex items-start gap-0">
        <div
          className="tl-line absolute top-5 h-px origin-left pointer-events-none"
          style={{
            left: linePct,
            right: linePct,
            background: `linear-gradient(to right, var(--accent), oklch(from var(--accent) l c h / 0.3))`,
          }}
        />

        {nodes.map((node, i) => (
          <div
            key={i}
            className="tl-node flex-1 flex flex-col items-center gap-0 opacity-0"
          >
            <div
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 mb-4 relative"
              style={{
                borderColor: "var(--accent)",
                background: "var(--bg)",
                color: "var(--accent)",
                zIndex: "var(--z-overlay)",
              }}
            >
              {i + 1}
            </div>

            <div className="text-center px-2">
              <p className="font-bold text-sm mb-1 leading-tight">{node.label}</p>
              <p className="text-xs opacity-50 mb-2">Day {node.days}</p>
              <p className="text-xs leading-relaxed opacity-60">{node.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
