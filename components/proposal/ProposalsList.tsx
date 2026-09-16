"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { AnimatedProposalCard } from "./AnimatedProposalCard";
import Toast from "@/components/ui/Toast";
import { Card } from "@/components/ui/design-card";
import { commonClasses } from "@/lib/design-system";
import { RefreshCw, Search } from "lucide-react";
import type { AnimatedProposal } from "@/types/animated-proposal";

interface ProposalsListProps {
  initialProposals: AnimatedProposal[];
  userRole: "admin" | "sales_rep";
}

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Sent", value: "sent" },
  { label: "Client Signed", value: "client_signed" },
  { label: "Counter Signed", value: "counter_signed" },
  { label: "Paid", value: "paid" },
  { label: "Archived", value: "archived" },
];

export default function ProposalsList({ initialProposals, userRole }: ProposalsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [proposals, setProposals] = useState(initialProposals);
  const [isLoading, setIsLoading] = useState(false);

  const filter = searchParams.get("filter") || "all";
  const searchQuery = searchParams.get("search") || "";
  const createdBy = searchParams.get("created_by");

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" | "info" });

  const refreshProposals = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (filter === "archived") params.set("archivedOnly", "true");
      else params.set("includeArchived", "false");
      if (createdBy) params.set("createdBy", createdBy);

      const { data } = await axios.get(`/api/animated-proposals?${params}`);
      setProposals(data.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refreshProposals(); }, [filter, createdBy]);

  useEffect(() => { setLocalSearchQuery(searchQuery); }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => updateUrlParams(undefined, value), 300);
  };

  const updateUrlParams = (newFilter?: string, newSearch?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter !== undefined) {
      newFilter === "all" ? params.delete("filter") : params.set("filter", newFilter);
    }
    if (newSearch !== undefined) {
      newSearch === "" ? params.delete("search") : params.set("search", newSearch);
    }
    router.push(params.toString() ? `?${params.toString()}` : window.location.pathname);
  };

  const handleRemove = (id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id));
    setToast({ visible: true, message: "Proposal archived", type: "success" });
  };

  const filteredProposals = useMemo(() => {
    const q = localSearchQuery.toLowerCase().trim();
    return proposals
      .filter(p => {
        if (filter === "archived") return p.archived_at !== null;
        if (filter !== "all") return p.archived_at === null && p.status === filter;
        return p.archived_at === null;
      })
      .filter(p => {
        if (!q) return true;
        return (
          p.company_name?.toLowerCase().includes(q) ||
          p.client_full_name?.toLowerCase().includes(q) ||
          p.project_title?.toLowerCase().includes(q) ||
          p.order_id?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [proposals, filter, localSearchQuery]);

  const groupedByMonth = useMemo(() => {
    const grouped: Record<string, AnimatedProposal[]> = {};
    filteredProposals.forEach(proposal => {
      const monthYear = new Date(proposal.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      (grouped[monthYear] ??= []).push(proposal);
    });
    return Object.entries(grouped).sort(
      (a, b) => new Date(b[1][0].created_at).getTime() - new Date(a[1][0].created_at).getTime()
    );
  }, [filteredProposals]);

  if (proposals.length === 0) {
    return (
      <Card variant="elevated" className="p-12 text-center">
        <p className="text-text-muted mb-6">No proposals found</p>
        <p className="text-text-muted mb-6">Create your proposal using MCP</p>
      </Card>
    );
  }

  return (
    <div>
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
      />

      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by client name, company, project, or order ID…"
            value={localSearchQuery}
            onChange={handleSearchChange}
            className={`w-full pl-10 pr-4 py-2 ${commonClasses.input} rounded-lg focus:outline-none focus:ring-2 focus:ring-border-focus`}
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-text-muted text-sm">{filteredProposals.length} proposals</p>
            <div className="bg-surface-elevated rounded-lg p-1 flex flex-wrap gap-0.5">
              {STATUS_FILTERS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => updateUrlParams(value)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${filter === value ? "bg-surface-interactive text-text-primary" : "text-text-muted hover:text-text-primary"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={refreshProposals}
            disabled={isLoading}
            className="bg-surface-interactive hover:bg-interactive-secondary-hover text-text-primary px-3 py-2 rounded-lg transition-colors flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {filteredProposals.length === 0 ? (
        <Card variant="elevated" className="p-8 text-center">
          <p className="text-text-muted">No proposals match the current filters.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedByMonth.map(([monthYear, items]) => (
            <div key={monthYear}>
              <h2 className="text-xl font-semibold text-text-secondary mb-4 pb-2 border-b border-border-secondary flex items-center justify-between">
                <span>{monthYear}</span>
                <span className="text-sm font-normal text-text-muted">{items.length} {items.length === 1 ? "proposal" : "proposals"}</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {items.map(proposal => (
                  <AnimatedProposalCard key={proposal.id} proposal={proposal} onRemove={handleRemove} userRole={userRole} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
