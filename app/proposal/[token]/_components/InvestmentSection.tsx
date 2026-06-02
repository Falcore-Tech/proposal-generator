"use client";

import { useEffect, useRef } from "react";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { SectionHeader } from "./_ui/SectionHeader";
import { Eyebrow } from "./_ui/Eyebrow";
import { Heading } from "./_ui/Heading";
import { Text } from "./_ui/Text";

interface Props {
  totalPriceCents: number;
  milestoneCents: number | null;
  retainerPriceCents: number | null;
  retainerBullets: string[];
  currency: string;
  paymentOptionsText?: string | null;
}

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);
}

export function InvestmentSection({
  totalPriceCents, milestoneCents, retainerPriceCents, retainerBullets, currency, paymentOptionsText,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        const els = sectionRef.current?.querySelectorAll(".inv-reveal");
        if (!els) return;
        els.forEach((el, i) => {
          gsap.fromTo(el, { y: MOTION.yFrom * 2, opacity: 0 }, {
            y: 0, opacity: 1, duration: MOTION.slow,
            delay: i * 0.15,
            ease: MOTION.easeOut,
            scrollTrigger: { trigger: sectionRef.current, start: MOTION.scrollStart },
          });
        });
      });
    });
  }, []);

  return (
    <Section ref={sectionRef} className="py-20 md:py-28">
      <SectionHeader
        eyebrow="Investment"
        title="What it costs"
        description="Clear pricing, scoped to the work above. No surprises."
      />

      <div className="mt-6 md:mt-8">
        <Eyebrow className="opacity-35 mb-3">Total Project Investment</Eyebrow>
        <Heading
          as="p"
          size="h1"
          weight={300}
          className="inv-reveal opacity-0 tabular-nums"
          style={{ color: "var(--accent)" }}
        >
          {fmt(totalPriceCents, currency)}
        </Heading>

        {paymentOptionsText ? (
          <Text as="div" variant="caption" muted className="mt-5 whitespace-pre-line max-w-xl">
            {paymentOptionsText}
          </Text>
        ) : !retainerPriceCents && retainerBullets.length > 0 ? (
          <ul className="mt-5 space-y-2 text-[var(--fs-caption)] opacity-65 max-w-xl">
            {retainerBullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-2 w-1 h-1 rounded-full shrink-0"
                  style={{ background: "var(--accent)" }}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        ) : milestoneCents ? (
          <Text variant="caption" className="mt-5 opacity-45">
            First milestone:{" "}
            <span className="font-semibold opacity-80">{fmt(milestoneCents, currency)}</span>
          </Text>
        ) : null}
      </div>

      {retainerPriceCents && (
        <div className="inv-reveal opacity-0 mt-20 md:mt-28 border-t border-[color:var(--border)] pt-12 md:pt-16">
          <Eyebrow className="opacity-35 mb-3">Monthly Retainer</Eyebrow>
          <Heading
            as="p"
            size="h2"
            weight={300}
            className="tabular-nums"
            style={{ color: "oklch(from var(--accent) l c h / 0.55)" }}
          >
            {fmt(retainerPriceCents, currency)}
            <span style={{ fontSize: "0.3em", opacity: 0.65, fontStyle: "normal" }}>/mo</span>
          </Heading>

          {retainerBullets.length > 0 && (
            <ul className="mt-10 space-y-3 max-w-md">
              {retainerBullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-[var(--fs-caption)] opacity-55">
                  <span
                    className="mt-2 w-1 h-1 rounded-full shrink-0"
                    style={{ background: "var(--accent)" }}
                  />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Section>
  );
}
