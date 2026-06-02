"use client";

import { useEffect, useRef, useState } from "react";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { Eyebrow } from "./_ui/Eyebrow";
import { Heading } from "./_ui/Heading";
import { Text } from "./_ui/Text";

interface Props {
  guaranteeText: string;
  phaseTwoTeaser: string | null;
}

const TYPEWRITER_MS = 20;

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
    <Section
      ref={sectionRef}
      className="py-24 md:py-36"
      style={{
        background: "var(--accent)",
      }}
    >
      <div className="">
        <Eyebrow
          className="mb-8 opacity-100"
          style={{ color: "oklch(from var(--accent) 0.95 0.02 h)" }}
        >
          Our Guarantee
        </Eyebrow>

        <Heading
          as="blockquote"
          size="h2"
          className="leading-snug"
          style={{ color: "oklch(1 0 0)" }}
        >
          {displayedText}
          {started && displayedText.length < guaranteeText.length && (
            <span
              className="animate-pulse"
              style={{ color: "oklch(1 0 0 / 0.5)" }}
            >
              |
            </span>
          )}
        </Heading>

        {phaseTwoTeaser && (
          <Text
            variant="body"
            className="mt-10 md:mt-14 max-w-2xl"
            style={{ color: "oklch(1 0 0 / 0.65)" }}
          >
            {phaseTwoTeaser}
          </Text>
        )}
      </div>
    </Section>
  );
}
