"use client";

import { useState } from "react";
import type { TermsClause } from "@/types/animated-proposal";
import { Section } from "./_ui/Section";
import { Eyebrow } from "./_ui/Eyebrow";

interface Props {
  terms: TermsClause[];
}

export function TermsSection({ terms }: Props) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <Section>
      <Eyebrow>Terms & Conditions</Eyebrow>
      <p className="text-lg md:text-xl opacity-80 mb-8 md:mb-12">Mutual agreements that protect us both.</p>

      <div className="space-y-3">
        {terms.map((clause) => (
          <div
            key={clause.clause_no}
            className="border border-[color:var(--border)] rounded-[var(--r-card)] overflow-hidden"
          >
            <button
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-current/5 transition-colors"
              onClick={() => setOpen(open === clause.clause_no ? null : clause.clause_no)}
            >
              <span className="flex items-center gap-4">
                <span className="text-xs opacity-40 font-mono">{clause.clause_no}</span>
                <span className="font-semibold">{clause.title}</span>
              </span>
              <span
                className="text-lg transition-transform"
                style={{
                  color: "var(--accent)",
                  transform: open === clause.clause_no ? "rotate(45deg)" : "none",
                }}
              >
                +
              </span>
            </button>

            {open === clause.clause_no && (
              <div className="px-6 pb-5 pt-1 border-t border-[color:var(--border)]">
                <p className="text-sm leading-relaxed opacity-70 whitespace-pre-line">{clause.body}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
