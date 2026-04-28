"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";
import { Card } from "@/components/ui/design-card";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown";
import { MoreHorizontal, Eye, Edit, Archive, Copy } from "lucide-react";
import type { AnimatedProposal } from "@/types/animated-proposal";
import { UnifiedStatusPill } from "./UnifiedStatusPill";
import { BrandTag } from "./BrandTag";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

interface Props {
  proposal: AnimatedProposal;
  onRemove?: (id: string) => void;
  userRole?: "admin" | "sales_rep";
}

const ANIMATED_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "sent", label: "Sent" },
  { value: "client_signed", label: "Client Signed" },
  { value: "counter_signed", label: "Counter Signed" },
  { value: "paid", label: "Paid" },
  { value: "archived", label: "Archived" },
];

const STATUS_CLASSES: Record<string, string> = {
  draft: "bg-status-draft text-status-draft-foreground",
  sent: "bg-status-sent text-status-sent-foreground",
  paid: "bg-status-paid text-status-paid-foreground",
  pending_approval: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-emerald-500/20 text-emerald-400",
  client_signed: "bg-blue-500/20 text-blue-400",
  counter_signed: "bg-indigo-500/20 text-indigo-400",
  archived: "bg-status-expired text-status-expired-foreground",
};

const STATUS_BORDER: Record<string, string> = {
  draft: "border-l-status-draft",
  sent: "border-l-status-sent",
  paid: "border-l-status-paid",
  pending_approval: "border-l-yellow-500",
  approved: "border-l-emerald-500",
  client_signed: "border-l-blue-500",
  counter_signed: "border-l-indigo-500",
  archived: "border-l-status-expired",
};

export function AnimatedProposalCard({ proposal, onRemove, userRole }: Props) {
  const [copied, setCopied] = useState(false);
  const [localStatus, setLocalStatus] = useState(proposal.status);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isArchived = !!proposal.archived_at;
  const publicLink = `${BASE_URL}/proposal/${proposal.token}`;
  const borderClass = STATUS_BORDER[localStatus] ?? "border-l-border-primary";
  const isAdmin = userRole === "admin";

  async function handleStatusChange(newStatus: string) {
    if (newStatus === localStatus) return;
    setStatusUpdating(true);
    setError(null);
    try {
      await axios.patch(`/api/animated-proposals/${proposal.id}`, { status: newStatus });
      setLocalStatus(newStatus as typeof localStatus);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Status update failed");
    } finally {
      setStatusUpdating(false);
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
              {["approved", "sent", "client_signed", "counter_signed", "paid"].includes(localStatus) && (
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
          {isAdmin ? (
            <select
              value={localStatus}
              disabled={statusUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`text-xs font-semibold rounded px-2 py-1 border-0 cursor-pointer disabled:opacity-50 ${STATUS_CLASSES[localStatus] ?? "bg-surface-elevated text-text-muted"}`}
            >
              {ANIMATED_STATUSES.map((s) => (
                <option key={s.value} value={s.value} className="bg-surface-primary text-text-primary font-normal">
                  {s.label.toUpperCase()}
                </option>
              ))}
            </select>
          ) : (
            <UnifiedStatusPill kind="animated" status={localStatus} />
          )}
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
            {!isArchived && !["paid"].includes(localStatus) && (
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
