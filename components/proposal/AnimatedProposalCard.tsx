"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";
import { Card } from "@/components/ui/design-card";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { MoreHorizontal, Eye, Edit, CheckCircle, Archive, Copy } from "lucide-react";
import type { AnimatedProposal } from "@/types/animated-proposal";
import { UnifiedStatusPill } from "./UnifiedStatusPill";
import { BrandTag } from "./BrandTag";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

interface Props {
  proposal: AnimatedProposal;
  onRemove?: (id: string) => void;
  userRole?: "admin" | "sales_rep";
}

export function AnimatedProposalCard({ proposal, onRemove, userRole }: Props) {
  const [copied, setCopied] = useState(false);
  const [approving, setApproving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isArchived = !!proposal.archived_at;
  const canApprove = userRole === "admin" && ["draft", "pending_approval"].includes(proposal.status);
  const publicLink = `${BASE_URL}/proposal/${proposal.token}`;

  const statusBorderMap: Record<string, string> = {
    draft: "border-l-status-draft",
    sent: "border-l-status-sent",
    paid: "border-l-status-paid",
    pending_approval: "border-l-yellow-500",
    approved: "border-l-emerald-500",
    client_signed: "border-l-blue-500",
    counter_signed: "border-l-indigo-500",
    archived: "border-l-status-expired",
  };
  const borderClass = statusBorderMap[proposal.status] ?? "border-l-border-primary";

  async function handleApprove() {
    setApproving(true);
    setError(null);
    try {
      await axios.post(`/api/animated-proposals/${proposal.id}/approve`);
      window.location.reload();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Approval failed");
    } finally {
      setApproving(false);
    }
  }

  async function handleArchive() {
    setArchiving(true);
    setError(null);
    try {
      await axios.post(`/api/animated-proposals/${proposal.id}/archive`);
      if (onRemove) onRemove(proposal.id);
      else window.location.reload();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Archive failed");
    } finally {
      setArchiving(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fmtPrice = (cents: number, currency: string) =>
    new Intl.NumberFormat("en-AE", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);

  return (
    <Card
      variant="primary"
      size="none"
      className={`shadow-lg transition-all hover:shadow-xl hover:border-border-interactive border-l-4 ${borderClass} ${isArchived ? "opacity-75 border border-status-expired/30" : ""}`}
    >
      <div className="px-4 py-2 flex justify-between items-center border-b border-border-secondary">
        <div className="flex items-start gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/proposals/animated/${proposal.id}`}>
                <h2 className="text-lg font-bold hover:text-text-secondary transition-colors">
                  {proposal.company_name}
                </h2>
              </Link>
              {["approved", "sent", "client_signed", "counter_signed", "paid"].includes(proposal.status) && (
                <button onClick={copyLink} className="text-text-muted hover:text-text-primary transition-colors">
                  <Copy size={14} />
                </button>
              )}
              <BrandTag brand={proposal.brand} />
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Animated
              </span>
            </div>
            <p className="text-sm text-text-muted">{proposal.client_full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UnifiedStatusPill kind="animated" status={proposal.status} />
          <Dropdown
            trigger={
              <button className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-interactive rounded transition-colors">
                <MoreHorizontal size={16} />
              </button>
            }
            align="right"
          >
            <Link href={`/proposals/animated/${proposal.id}`}>
              <DropdownItem className="flex items-center gap-2">
                <Eye size={14} />
                View Details
              </DropdownItem>
            </Link>
            <Link href={`/proposals/animated/${proposal.id}/edit`}>
              <DropdownItem className="flex items-center gap-2">
                <Edit size={14} />
                Edit Proposal
              </DropdownItem>
            </Link>
            {canApprove && (
              <DropdownItem
                onClick={handleApprove}
                disabled={approving}
                className="flex items-center gap-2"
              >
                <CheckCircle size={14} />
                {approving ? "Approving…" : "Approve & Activate"}
              </DropdownItem>
            )}
            {!isArchived && !["paid"].includes(proposal.status) && (
              <>
                <DropdownSeparator />
                <DropdownItem
                  onClick={handleArchive}
                  disabled={archiving}
                  className="text-status-expired hover:bg-status-expired/20 flex items-center gap-2"
                >
                  <Archive size={14} />
                  {archiving ? "Archiving…" : "Archive"}
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm font-medium text-text-secondary mb-1 truncate">{proposal.project_title}</p>
        <div className="text-xs text-text-muted flex items-center gap-2 flex-wrap">
          <span>{fmtPrice(proposal.total_price_cents, proposal.currency)}</span>
          <span>•</span>
          <span>{format(new Date(proposal.created_at), "dd MMM yyyy")}</span>
          {copied && <span className="text-emerald-400">Link copied!</span>}
        </div>
        {error && <p className="text-semantic-error text-xs mt-2">{error}</p>}
      </div>
    </Card>
  );
}
