"use client";

import { useState } from "react";
import type { TermsClause } from "@/types/animated-proposal";
import { Section } from "./_ui/Section";
import { SectionHeader } from "./_ui/SectionHeader";
import { Heading } from "./_ui/Heading";
import { Text } from "./_ui/Text";

interface Props {
  terms: TermsClause[];
}

export function TermsSection({ terms }: Props) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <Section>
      <SectionHeader
        eyebrow="Terms & Conditions"
        title="The fine print"
        description="Mutual agreements that protect us both."
      />

      <div>
        {terms.map((clause) => {
          const isOpen = open === clause.clause_no;
          return (
            <div key={clause.clause_no} className="border-t border-[color:var(--border)]">
              <button
                className="w-full flex items-center justify-between py-5 md:py-6 text-left group"
                onClick={() => setOpen(isOpen ? null : clause.clause_no)}
              >
                <span className="flex items-center gap-5">
                  <Heading
                    as="span"
                    size="numeral-sm"
                    className="tabular-nums shrink-0 opacity-30"
                    style={{ minWidth: "2.5rem" }}
                  >
                    {clause.clause_no}
                  </Heading>
                  <Heading as="span" size="h3">{clause.title}</Heading>
                </span>
                <span
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-[color:var(--border)] ml-4 transition-transform duration-300"
                  style={{
                    color: "var(--accent)",
                    transform: isOpen ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </span>
              </button>

              {isOpen && (
                <div className="pb-6 pl-16 md:pl-20 pr-4 md:pr-8">
                  <Text variant="caption" className="opacity-60 whitespace-pre-line">{clause.body}</Text>
                </div>
              )}
            </div>
          );
        })}
        <div className="border-t border-[color:var(--border)]" />
      </div>
    </Section>
  );
}
