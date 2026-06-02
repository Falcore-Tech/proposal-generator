"use client";

import { useEffect, useRef } from "react";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { Heading } from "./_ui/Heading";
import { Divider } from "./_ui/Divider";

interface Props {
  clientFirstName: string;
  body: string;
}

export function PersonalProblem({ clientFirstName, body }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const greetingRef = useRef<HTMLElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        const tl = gsap.timeline({
          scrollTrigger: { trigger: sectionRef.current, start: MOTION.scrollStart },
        });

        tl.fromTo(greetingRef.current, { y: MOTION.yFrom, opacity: 0 }, { y: 0, opacity: 1, duration: MOTION.base, ease: MOTION.easeOut })
          .fromTo(ruleRef.current, { scaleX: 0 }, { scaleX: 1, duration: MOTION.fast, ease: MOTION.easeOut, transformOrigin: "left" }, "-=0.4")
          .fromTo(bodyRef.current, { y: MOTION.yFrom, opacity: 0 }, { y: 0, opacity: 1, duration: MOTION.base, ease: MOTION.easeOut }, "-=0.3");
      });
    });
  }, []);

  return (
    <Section ref={sectionRef} className="py-20 md:py-32">
      <Heading
        ref={greetingRef}
        as="h2"
        size="script"
        font="script"
        weight={400}
        style={{ color: "var(--fg)", opacity: 0 }}
      >
        {clientFirstName},
      </Heading>

      <Divider ref={ruleRef} className="mt-4 md:mt-5" style={{ transformOrigin: "left" }} />

      <Heading
        ref={bodyRef}
        as="p"
        size="script-sm"
        font="script"
        weight={400}
        className="mt-6 md:mt-8"
        style={{
          color: "oklch(from var(--fg) l c h / 0.7)",
          maxWidth: "38ch",
          opacity: 0,
        }}
      >
        {body}
      </Heading>
    </Section>
  );
}
