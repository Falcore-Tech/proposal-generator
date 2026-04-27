"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "@/components/auth/AuthProvider";
import SignatureCanvas from "react-signature-canvas";
import type { AnimatedProposal, AnimatedProposalEvent } from "@/types/animated-proposal";
import { StatusPill } from "@/app/animated/[token]/_components/_ui/StatusPill";
import { Spinner } from "@/app/animated/[token]/_components/_ui/Spinner";
import { Button } from "@/app/animated/[token]/_components/_ui/Button";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "";

export default function AnimatedProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userRole } = useAuth();
  const [proposal, setProposal] = useState<AnimatedProposal | null>(null);
  const [events, setEvents] = useState<AnimatedProposalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
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

  async function handleApprove() {
    setApproving(true);
    setError(null);
    try {
      const { data } = await axios.post(`/api/animated-proposals/${id}/approve`);
      setProposal(data);
    } catch (e) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Approval failed");
    } finally {
      setApproving(false);
    }
  }

  async function handleArchive() {
    if (!confirm("Archive this proposal? It will be hidden from active lists.")) return;
    setArchiving(true);
    try {
      await axios.post(`/api/animated-proposals/${id}/archive`);
      router.push("/animated-proposals");
    } catch (e) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Archive failed");
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
      await axios.post(`/api/animated-proposals/${id}/sign/provider`, {
        signature_png_base64: pngData,
      });
      await load();
    } catch (e) {
      setError((e as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Counter-sign failed");
    } finally {
      setCounterSigning(false);
    }
  }

  async function copyLink() {
    if (!proposal) return;
    const link = `${BASE_URL}/animated/${proposal.token}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (loading) {
    return (
      <div className="theme-animated min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="theme-animated min-h-screen flex items-center justify-center">
        <p>{error ?? "Proposal not found"}</p>
      </div>
    );
  }

  const isAdmin = userRole === "admin";
  const publicLink = `${BASE_URL}/proposal/${proposal.token}`;
  const canApprove = isAdmin && ["draft", "pending_approval"].includes(proposal.status);
  const canCounterSign = proposal.status === "client_signed";

  return (
    <div className="theme-animated min-h-screen px-6 md:px-10 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 opacity-40 text-sm mb-8">
          <button onClick={() => router.back()} className="hover:opacity-100 transition-opacity">
            ← Back
          </button>
          <span>/</span>
          <span>{proposal.company_name}</span>
        </div>

        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-[var(--r-card)] text-sm"
            style={{
              background: "oklch(from var(--accent) l c h / 0.15)",
              border: "1px solid oklch(from var(--accent) l c h / 0.3)",
              color: "var(--accent)",
            }}
          >
            {error}
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">{proposal.project_title}</h1>
              <p className="opacity-40 mt-1">{proposal.client_full_name} · {proposal.company_name}</p>
            </div>
            <StatusPill status={proposal.status} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <InfoCard label="Total Value" value={fmtPrice(proposal.total_price_cents, proposal.currency)} />
          <InfoCard label="Created" value={format(new Date(proposal.created_at), "dd MMM yyyy")} />
          <InfoCard label="Brand" value={proposal.brand === "xma_media" ? "XMA Media" : "XMA Agency"} />
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {["approved", "sent", "client_signed", "counter_signed", "paid"].includes(proposal.status) && (
            <Button variant="muted" size="sm" onClick={copyLink}>
              {copiedLink ? "Copied!" : "Copy Public Link"}
            </Button>
          )}
          <Button variant="muted" size="sm" onClick={() => window.open(`${publicLink}?preview=1`, "_blank")}>
            Preview →
          </Button>
          {canApprove && (
            <Button size="sm" onClick={handleApprove} disabled={approving}>
              {approving ? "Approving…" : "Approve & Activate"}
            </Button>
          )}
          {isAdmin && !["archived", "paid"].includes(proposal.status) && (
            <Button variant="outline" size="sm" onClick={handleArchive} disabled={archiving}>
              {archiving ? "Archiving…" : "Archive"}
            </Button>
          )}
        </div>

        {canCounterSign && (
          <div className="mb-8 border border-[color:var(--border)] rounded-[var(--r-card-lg)] p-6">
            <h3 className="font-bold mb-4">Counter-Sign</h3>
            <p className="opacity-40 text-sm mb-4">
              Client has signed. Draw your counter-signature below.
            </p>
            <div
              className="border-2 rounded-[var(--r-card)] overflow-hidden mb-4"
              style={{ borderColor: "var(--accent)" }}
            >
              <SignatureCanvas
                ref={sigRef}
                penColor="oklch(0.577 0.245 27.325)"
                canvasProps={{ className: "w-full", height: 160, style: { background: "white" } }}
              />
            </div>
            <div className="flex gap-3">
              <Button size="sm" onClick={handleCounterSign} disabled={counterSigning}>
                {counterSigning ? "Submitting…" : "Submit Counter-Signature"}
              </Button>
              <Button variant="muted" size="sm" onClick={() => sigRef.current?.clear()}>
                Clear
              </Button>
            </div>
          </div>
        )}

        {proposal.stripe_link && (
          <div className="mb-8 border border-[color:var(--border)] rounded-[var(--r-card-lg)] p-6">
            <h3 className="font-bold mb-2">Stripe Payment Link</h3>
            <a
              href={proposal.stripe_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm break-all transition-opacity hover:opacity-70"
              style={{ color: "var(--accent)" }}
            >
              {proposal.stripe_link}
            </a>
          </div>
        )}

        {events.length > 0 && (
          <div className="border border-[color:var(--border)] rounded-[var(--r-card-lg)] p-6">
            <h3 className="font-bold mb-4">Engagement Events</h3>
            <div className="space-y-2">
              {events.slice(0, 20).map((ev) => (
                <div key={ev.id} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{ev.event_type.replace(/_/g, " ")}</span>
                  <span className="opacity-40 text-xs">{format(new Date(ev.created_at), "dd MMM HH:mm")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-(--muted) rounded-[var(--r-card)] px-5 py-4">
      <p className="text-xs uppercase tracking-wide opacity-40 mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function fmtPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);
}
