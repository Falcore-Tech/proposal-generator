"use client";

import { useEffect, useRef, useState } from "react";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { Eyebrow } from "./_ui/Eyebrow";

interface Props {
  guaranteeText: string;
  phaseTwoTeaser: string | null;
}

const TYPEWRITER_MS = 18;

export function GuaranteeSection({ guaranteeText, phaseTwoTeaser }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: MOTION.scrollStart,
          onEnter: () => setStarted(true),
          once: true,
        });
      });
    });
  }, []);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(guaranteeText.slice(0, i));
      i++;
      if (i > guaranteeText.length) clearInterval(interval);
    }, TYPEWRITER_MS);
    return () => clearInterval(interval);
  }, [started, guaranteeText]);

  return (
    <Section ref={sectionRef}>
      <Eyebrow>Our Guarantee</Eyebrow>

      <blockquote
        className="text-xl md:text-2xl leading-relaxed border-l-4 pl-6 md:pl-8 py-2"
        style={{ borderColor: "var(--accent)" }}
      >
        {displayedText}
        {started && displayedText.length < guaranteeText.length && (
          <span className="animate-pulse">|</span>
        )}
      </blockquote>

      {phaseTwoTeaser && (
        <p className="mt-8 md:mt-12 text-base opacity-60 max-w-2xl">{phaseTwoTeaser}</p>
      )}
    </Section>
  );
}
