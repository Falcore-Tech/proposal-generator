"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import type { AnimatedProposalStatus } from "@/types/animated-proposal";
import { Section } from "./_ui/Section";
import { Eyebrow } from "./_ui/Eyebrow";
import { Button, animButtonVariants } from "./_ui/Button";
import { useAccentColor } from "../_lib/useAccentColor";

interface Props {
  proposalId: string;
  clientSignedAt: string | null;
  stripeLink: string | null;
  status: AnimatedProposalStatus;
}

export function SignatureSection({ proposalId, clientSignedAt, stripeLink, status }: Props) {
  const sigRef = useRef<SignatureCanvas>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(!!clientSignedAt);
  const [error, setError] = useState<string | null>(null);
  const [accentColor, sectionRef] = useAccentColor();

  const canSign = ["approved", "sent"].includes(status) && !signed;
  const showStripe = (status === "counter_signed" || status === "paid") && stripeLink;

  async function handleSign() {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError("Please draw your signature first.");
      return;
    }
    setSigning(true);
    setError(null);
    try {
      const pngData = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
      await axios.post(`/api/animated-proposals/${proposalId}/sign/client`, {
        signature_png_base64: pngData,
      });
      setSigned(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : null;
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? msg ?? "Failed to submit signature. Please try again.");
    } finally {
      setSigning(false);
    }
  }

  return (
    <Section ref={sectionRef} narrow>
      <Eyebrow>Sign & Proceed</Eyebrow>

      {signed ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-6">✓</div>
          <h2 className="text-[var(--fs-h2)] font-black mb-4" style={{ fontFamily: "var(--font-body)" }}>
            Proposal Signed
          </h2>
          <p className="opacity-60 mb-8">
            Your signature has been received. We&apos;ll counter-sign and send you a confirmation.
          </p>

          {showStripe && (
            <a
              href={stripeLink}
              target="_blank"
              rel="noopener noreferrer"
              className={animButtonVariants({ size: "lg" })}
              style={{ background: "var(--accent)" }}
              onClick={() =>
                axios.post(`/api/animated-proposals/${proposalId}/events`, { event_type: "stripe_click" }).catch(() => {})
              }
            >
              Confirm & Make Payment →
            </a>
          )}
        </div>
      ) : canSign ? (
        <div>
          <h2 className="text-[var(--fs-h2)] font-black mb-6" style={{ fontFamily: "var(--font-body)" }}>
            Sign the Proposal
          </h2>
          <p className="opacity-60 mb-8">
            By signing below, you agree to the terms and confirm your intent to proceed.
          </p>

          <div
            className="border-2 rounded-[var(--r-card-lg)] overflow-hidden mb-6"
            style={{ borderColor: "var(--accent)" }}
          >
            <SignatureCanvas
              ref={sigRef}
              penColor={accentColor}
              canvasProps={{ className: "w-full", height: 200, style: { background: "white" } }}
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex gap-4 flex-wrap">
            <Button onClick={handleSign} disabled={signing} size="md">
              {signing ? "Submitting…" : "Confirm Signature"}
            </Button>
            <Button variant="outline" size="md" onClick={() => sigRef.current?.clear()}>
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 opacity-40">
          <p>This proposal is not yet open for signing.</p>
        </div>
      )}
    </Section>
  );
}
