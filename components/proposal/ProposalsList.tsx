"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProposalCard from "./ProposalCard";
import { AnimatedProposalCard } from "./AnimatedProposalCard";
import Toast from "@/components/ui/Toast";
import { Card } from "@/components/ui/design-card";
import { commonClasses, brandButtonVariants } from "@/lib/design-system";
import { RefreshCw, Plus, Search } from "lucide-react";
import type { AnimatedProposal } from "@/types/animated-proposal";

type TypeFilter = "all" | "classic" | "animated";
type BrandFilter = "all" | "xma" | "xma_media";

interface ProposalsListProps {
  initialClassic: any[];
  initialAnimated: AnimatedProposal[];
  userRole: "admin" | "sales_rep";
}

export default function ProposalsList({ initialClassic, initialAnimated, userRole }: ProposalsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [classicProposals, setClassicProposals] = useState(initialClassic);
  const [animatedProposals, setAnimatedProposals] = useState(initialAnimated);
  const [isLoading, setIsLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [brandFilter, setBrandFilter] = useState<BrandFilter>("all");

  const filter = searchParams.get("filter") || "all";
  const searchQuery = searchParams.get("search") || "";
  const createdBy = searchParams.get("created_by");

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as "success" | "error" | "info" });

  const refreshProposals = async () => {
    setIsLoading(true);
    try {
      const classicParams = new URLSearchParams();
      const animatedParams = new URLSearchParams({ limit: "200" });

      if (filter === "archived") {
        classicParams.set("archivedOnly", "true");
        animatedParams.set("archivedOnly", "true");
      } else {
        classicParams.set("includeArchived", "false");
        animatedParams.set("includeArchived", "false");
      }
      if (createdBy) {
        classicParams.set("createdBy", createdBy);
        animatedParams.set("createdBy", createdBy);
      }

      const [classicRes, animatedRes] = await Promise.all([
        fetch(`/api/proposals?${classicParams}`),
        fetch(`/api/animated-proposals?${animatedParams}`),
      ]);

      if (classicRes.ok) {
        const r = await classicRes.json();
        setClassicProposals(r.proposals || []);
      }
      if (animatedRes.ok) {
        const r = await animatedRes.json();
        setAnimatedProposals(r.data || []);
      }
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

  const handleRemoveClassic = (id: string) => {
    setClassicProposals(prev => prev.filter(p => p.id !== id));
    setToast({ visible: true, message: "Proposal removed", type: "success" });
  };

  const handleRemoveAnimated = (id: string) => {
    setAnimatedProposals(prev => prev.filter(p => p.id !== id));
    setToast({ visible: true, message: "Proposal archived", type: "success" });
  };

  const getClassicBrand = (p: any): "xma" | "xma_media" =>
    p.package?.brand ?? p.packages?.brand ?? "xma";

  const mergedAndFiltered = useMemo(() => {
    const q = localSearchQuery.toLowerCase().trim();

    const filteredClassic = classicProposals
      .filter(p => {
        if (typeFilter === "animated") return false;
        if (brandFilter !== "all" && getClassicBrand(p) !== brandFilter) return false;
        if (filter === "archived") return p.archived_at !== null;
        if (filter !== "all") return p.archived_at === null && p.status?.toLowerCase() === filter;
        return p.archived_at === null;
      })
      .filter(p => {
        if (!q) return true;
        const name = p.client?.name?.toLowerCase() || "";
        const company = p.client?.company_name?.toLowerCase() || p.company_name?.toLowerCase() || "";
        const orderId = p.order_id?.toLowerCase() || "";
        return name.includes(q) || company.includes(q) || orderId.includes(q);
      })
      .map(p => ({ kind: "classic" as const, created_at: p.created_at, id: p.id, raw: p }));

    const filteredAnimated = animatedProposals
      .filter(p => {
        if (typeFilter === "classic") return false;
        if (brandFilter !== "all" && p.brand !== brandFilter) return false;
        if (filter === "archived") return p.archived_at !== null;
        if (filter !== "all") return p.archived_at === null && p.status === filter;
        return p.archived_at === null;
      })
      .filter(p => {
        if (!q) return true;
        return (
          p.company_name?.toLowerCase().includes(q) ||
          p.client_full_name?.toLowerCase().includes(q) ||
          p.project_title?.toLowerCase().includes(q)
        );
      })
      .map(p => ({ kind: "animated" as const, created_at: p.created_at, id: p.id, raw: p }));

    return [...filteredClassic, ...filteredAnimated].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [classicProposals, animatedProposals, typeFilter, brandFilter, filter, localSearchQuery]);

  const groupByMonth = (items: typeof mergedAndFiltered) => {
    const grouped: Record<string, typeof mergedAndFiltered> = {};
    items.forEach(item => {
      const monthYear = new Date(item.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push(item);
    });
    return Object.entries(grouped).sort((a, b) =>
      new Date(b[1][0].created_at).getTime() - new Date(a[1][0].created_at).getTime()
    );
  };

  const grouped = groupByMonth(mergedAndFiltered);

  const statusButtons: Array<{ label: string; value: string }> = typeFilter === "animated"
    ? [
        { label: "All", value: "all" },
        { label: "Draft", value: "draft" },
        { label: "Pending", value: "pending_approval" },
        { label: "Approved", value: "approved" },
        { label: "Sent", value: "sent" },
        { label: "Client Signed", value: "client_signed" },
        { label: "Counter Signed", value: "counter_signed" },
        { label: "Paid", value: "paid" },
        { label: "Archived", value: "archived" },
      ]
    : typeFilter === "classic"
    ? [
        { label: "All", value: "all" },
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
        { label: "Accepted", value: "accepted" },
        { label: "Paid", value: "paid" },
        { label: "Archived", value: "archived" },
      ]
    : [
        { label: "All", value: "all" },
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
        { label: "Paid", value: "paid" },
        { label: "Archived", value: "archived" },
      ];

  if (classicProposals.length === 0 && animatedProposals.length === 0) {
    return (
      <Card variant="elevated" className="p-12 text-center">
        <p className="text-text-muted mb-6">No proposals found</p>
        <Link href="/proposal-generator" className={`${brandButtonVariants({ variant: "primary", size: "lg" })} inline-block`}>
          Create Your First Proposal
        </Link>
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

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide w-10 shrink-0">Type</span>
          {(["all", "classic", "animated"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${typeFilter === t ? "bg-brand-primary text-white" : "bg-surface-elevated text-text-muted hover:text-text-primary"}`}
            >
              {t === "all" ? "All" : t === "classic" ? "Classic" : "Animated"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-text-muted font-medium uppercase tracking-wide w-10 shrink-0">Brand</span>
          {(["all", "xma", "xma_media"] as const).map(b => (
            <button
              key={b}
              onClick={() => setBrandFilter(b)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${brandFilter === b ? "bg-brand-primary text-white" : "bg-surface-elevated text-text-muted hover:text-text-primary"}`}
            >
              {b === "all" ? "All" : b === "xma" ? "XMA" : "XMA Media"}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-text-muted text-sm">{mergedAndFiltered.length} proposals</p>
            <div className="bg-surface-elevated rounded-lg p-1 flex flex-wrap gap-0.5">
              {statusButtons.map(({ label, value }) => (
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

          <div className="flex items-center gap-2">
            <button
              onClick={refreshProposals}
              disabled={isLoading}
              className="bg-surface-interactive hover:bg-interactive-secondary-hover text-text-primary px-3 py-2 rounded-lg transition-colors flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Refreshing…" : "Refresh"}
            </button>
            <Link
              href="/proposal-generator"
              className="bg-brand-primary hover:bg-interactive-primary-hover text-text-primary px-4 py-2 rounded-lg transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Proposal
            </Link>
          </div>
        </div>
      </div>

      {mergedAndFiltered.length === 0 ? (
        <Card variant="elevated" className="p-8 text-center">
          <p className="text-text-muted">No proposals match the current filters.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {grouped.map(([monthYear, items]) => (
            <div key={monthYear}>
              <h2 className="text-xl font-semibold text-text-secondary mb-4 pb-2 border-b border-border-secondary flex items-center justify-between">
                <span>{monthYear}</span>
                <span className="text-sm font-normal text-text-muted">{items.length} {items.length === 1 ? "proposal" : "proposals"}</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {items.map(item =>
                  item.kind === "classic" ? (
                    <ProposalCard
                      key={item.id}
                      proposal={item.raw}
                      onDelete={handleRemoveClassic}
                      userRole={userRole}
                    />
                  ) : (
                    <AnimatedProposalCard
                      key={item.id}
                      proposal={item.raw as AnimatedProposal}
                      onRemove={handleRemoveAnimated}
                      userRole={userRole}
                    />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
