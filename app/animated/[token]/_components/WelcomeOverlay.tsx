"use client";

import { useEffect, useRef, useState } from "react";
import { Heading } from "./_ui/Heading";

interface Props {
  clientFirstName: string;
  companyName: string;
  onDismissed: () => void;
}

export function WelcomeOverlay({ clientFirstName, companyName, onDismissed }: Props) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const dismissed = useRef(false);

  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLElement>(null);
  const ruleRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";

    const holdTimer = setTimeout(() => setPhase("hold"), 100);
    const exitTimer = setTimeout(() => dismiss(), 3400);

    const onKey = () => dismiss();
    window.addEventListener("keydown", onKey, { once: true });

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (phase !== "hold") return;

    import("gsap").then(({ gsap }) => {
      const tl = gsap.timeline();

      tl.fromTo(
        eyebrowRef.current,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      )
        .fromTo(
          nameRef.current,
          { y: 48, opacity: 0, filter: "blur(12px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.0, ease: "power3.out" },
          "-=0.15"
        )
        .fromTo(
          ruleRef.current,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.6, ease: "power3.out", transformOrigin: "center" },
          "-=0.4"
        )
        .fromTo(
          companyRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" },
          "-=0.2"
        );
    });
  }, [phase]);

  function dismiss() {
    if (dismissed.current) return;
    dismissed.current = true;
    setPhase("exit");
    document.documentElement.style.overflow = "";
    setTimeout(onDismissed, 700);
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center px-6 cursor-pointer select-none"
      style={{
        background: "oklch(0.06 0.003 270)",
        zIndex: "var(--z-modal)",
        opacity: phase === "exit" ? 0 : 1,
        transform: phase === "exit" ? "translateY(-8px)" : "translateY(0)",
        transition:
          phase === "exit"
            ? "opacity 0.7s var(--ease-in), transform 0.7s var(--ease-in)"
            : "none",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
      onClick={dismiss}
    >
      <p
        ref={eyebrowRef}
        className="text-[var(--fs-eyebrow)] tracking-[var(--tracking-eyebrow)] uppercase mb-6 md:mb-10 opacity-0"
        style={{ color: "oklch(0.48 0 0)" }}
      >
        Prepared for
      </p>

      <Heading
        ref={nameRef}
        as="h1"
        size="display"
        font="display"
        italic
        weight={300}
        style={{ color: "oklch(0.97 0 0)", opacity: 0 }}
        className="text-center"
      >
        {clientFirstName}
      </Heading>

      <div
        ref={ruleRef}
        className="mt-10 h-px opacity-0"
        style={{
          width: "6rem",
          background: "oklch(0.32 0 0)",
          transformOrigin: "center",
        }}
      />

      {companyName && (
        <p
          ref={companyRef}
          className="mt-4 md:mt-6 text-[var(--fs-eyebrow)] tracking-[var(--tracking-eyebrow)] uppercase opacity-0"
          style={{ color: "oklch(0.38 0 0)" }}
        >
          {companyName}
        </p>
      )}
    </div>
  );
}
