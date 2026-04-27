"use client";

import { useEffect, useRef } from "react";
import { MOTION } from "../_lib/motion";
import { Section } from "./_ui/Section";
import { Eyebrow } from "./_ui/Eyebrow";

interface Props {
  totalPriceCents: number;
  milestoneCents: number | null;
  retainerPriceCents: number | null;
  retainerBullets: string[];
  currency: string;
}

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);
}

export function InvestmentSection({
  totalPriceCents, milestoneCents, retainerPriceCents, retainerBullets, currency,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);
        const els = sectionRef.current?.querySelectorAll(".inv-reveal");
        if (!els) return;
        els.forEach((el, i) => {
          gsap.fromTo(el, { y: MOTION.yFrom, opacity: 0 }, {
            y: 0, opacity: 1, duration: MOTION.base,
            delay: i * MOTION.stagger,
            ease: MOTION.easeOut,
            scrollTrigger: { trigger: sectionRef.current, start: MOTION.scrollStart },
          });
        });
      });
    });
  }, []);

  return (
    <Section ref={sectionRef}>
      <Eyebrow>Investment</Eyebrow>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
        <div className="inv-reveal opacity-0 border border-[color:var(--border)] rounded-[var(--r-card-lg)] p-6 md:p-8">
          <p className="text-sm opacity-50 mb-2">Total Project Investment</p>
          <p className="text-4xl md:text-5xl font-black tabular-nums" style={{ color: "var(--accent)" }}>
            {fmt(totalPriceCents, currency)}
          </p>
          {milestoneCents && (
            <p className="mt-4 text-sm opacity-60">
              50% milestone: <span className="font-semibold">{fmt(milestoneCents, currency)}</span>
            </p>
          )}
        </div>

        {retainerPriceCents && (
          <div className="inv-reveal opacity-0 border border-[color:var(--border)] rounded-[var(--r-card-lg)] p-6 md:p-8">
            <p className="text-sm opacity-50 mb-2">Monthly Retainer (ongoing)</p>
            <p className="text-4xl md:text-5xl font-black tabular-nums" style={{ color: "var(--accent)" }}>
              {fmt(retainerPriceCents, currency)}
              <span className="text-xl opacity-50">/mo</span>
            </p>
            {retainerBullets.length > 0 && (
              <ul className="mt-6 space-y-2">
                {retainerBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm opacity-70">
                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
