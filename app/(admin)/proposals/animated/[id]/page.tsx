"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "@/components/auth/AuthProvider";
import SignatureCanvas from "react-signature-canvas";
import Link from "next/link";
import type { AnimatedProposal, AnimatedProposalEvent } from "@/types/animated-proposal";
import { UnifiedStatusPill } from "@/components/proposal/UnifiedStatusPill";
import { BrandTag } from "@/components/proposal/BrandTag";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

function fmtPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);
}

export default function AnimatedProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userRole } = useAuth();
  const [proposal, setProposal] = useState<AnimatedProposal | null>(null);
  const [events, setEvents] = useState<AnimatedProposalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [counterSigning, setCounterSigning] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sigRef = useRef<SignatureCanvas>(null);

  async function load() {
    setLoading(true);
    try {
      const [{ data: prop }, { data: evData }] = await Promise.all([
        axios.get(`/api/animated-proposals/${id}`),
        axios.get(`/api/animated-proposals/${id}/events`).catch(() => ({ data: { data: [] } })),
      ]);
      setProposal(prop);
      setEvents(evData.data ?? []);
    } catch {
      setError("Failed to load proposal");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleArchive() {
    if (!confirm("Archive this proposal? It will be hidden from active lists.")) return;
    setArchiving(true);
    try {
      await axios.post(`/api/animated-proposals/${id}/archive`);
      router.push("/proposals");
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Archive failed");
      setArchiving(false);
    }
  }

  async function handleCounterSign() {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError("Draw your counter-signature first.");
      return;
    }
    setCounterSigning(true);
    setError(null);
    try {
      const pngData = sigRef.current.getCanvas().toDataURL("image/png");
      await axios.post(`/api/animated-proposals/${id}/sign/provider`, { signature_png_base64: pngData });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Counter-sign failed");
    } finally {
      setCounterSigning(false);
    }
  }

  async function copyLink() {
    if (!proposal) return;
    await navigator.clipboard.writeText(`${BASE_URL}/proposal/${proposal.token}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (loading) {
    return (
      <div className="bg-surface-primary min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="bg-surface-primary min-h-screen flex items-center justify-center">
        <p className="text-text-muted">{error ?? "Proposal not found"}</p>
      </div>
    );
  }

  const isAdmin = userRole === "admin";
  const publicLink = `${BASE_URL}/proposal/${proposal.token}`;
  const canCounterSign = proposal.status === "client_signed";

  return (
    <div className="bg-surface-primary min-h-screen px-6 md:px-10 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 text-sm text-text-muted mb-8">
          <button onClick={() => router.push("/proposals")} className="hover:text-text-primary transition-colors">
            ← All Proposals
          </button>
          <span>/</span>
          <span>{proposal.company_name}</span>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg text-sm bg-semantic-error/10 border border-semantic-error/30 text-semantic-error">
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold">{proposal.project_title}</h1>
                <BrandTag brand={proposal.brand} size="sm" />
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Animated
                </span>
              </div>
              <p className="text-text-muted text-sm">{proposal.client_full_name} · {proposal.company_name}</p>
            </div>
            <UnifiedStatusPill kind="animated" status={proposal.status} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Value", value: fmtPrice(proposal.total_price_cents, proposal.currency) },
            { label: "Created", value: format(new Date(proposal.created_at), "dd MMM yyyy") },
            { label: "Brand", value: proposal.brand === "xma_media" ? "XMA Media" : "XMA Agency" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-elevated rounded-lg px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-text-muted mb-1">{label}</p>
              <p className="font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant="outline" size="sm" onClick={copyLink}>
            {copiedLink ? "Copied!" : "Copy Public Link"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(`${publicLink}?preview=1`, "_blank")}>
            Preview →
          </Button>
          <Link href={`/proposals/animated/${id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit size={14} />
              Edit
            </Button>
          </Link>
          {isAdmin && !["archived", "paid"].includes(proposal.status) && (
            <Button variant="outline" size="sm" onClick={handleArchive} disabled={archiving}>
              {archiving ? "Archiving…" : "Archive"}
            </Button>
          )}
        </div>

        {canCounterSign && (
          <div className="mb-8 border border-border-primary rounded-lg p-6">
            <h3 className="font-bold mb-4">Counter-Sign</h3>
            <p className="text-text-muted text-sm mb-4">Client has signed. Draw your counter-signature below.</p>
            <div className="border-2 border-brand-primary rounded-lg overflow-hidden mb-4">
              <SignatureCanvas
                ref={sigRef}
                penColor="#dc2626"
                canvasProps={{ className: "w-full", height: 160, style: { background: "white" } }}
              />
            </div>
            <div className="flex gap-3">
              <Button size="sm" onClick={handleCounterSign} disabled={counterSigning}>
                {counterSigning ? "Submitting…" : "Submit Counter-Signature"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => sigRef.current?.clear()}>
                Clear
              </Button>
            </div>
          </div>
        )}

        {proposal.stripe_link && (
          <div className="mb-8 border border-border-primary rounded-lg p-6">
            <h3 className="font-bold mb-2">Stripe Payment Link</h3>
            <a
              href={proposal.stripe_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm break-all text-brand-primary hover:opacity-70 transition-opacity"
            >
              {proposal.stripe_link}
            </a>
          </div>
        )}

        {events.length > 0 && (
          <div className="border border-border-primary rounded-lg p-6">
            <h3 className="font-bold mb-4">Engagement Events</h3>
            <div className="space-y-2">
              {events.slice(0, 20).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-text-secondary">{ev.event_type.replace(/_/g, " ")}</span>
                  <span className="text-text-muted text-xs">{format(new Date(ev.created_at), "dd MMM HH:mm")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
