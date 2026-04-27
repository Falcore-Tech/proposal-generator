"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { format } from "date-fns";
import type { AnimatedProposal, AnimatedProposalStatus } from "@/types/animated-proposal";
import { StatusPill, STATUS_LABELS } from "@/app/animated/[token]/_components/_ui/StatusPill";
import { Spinner } from "@/app/animated/[token]/_components/_ui/Spinner";

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);
}

export default function AnimatedProposalsPage() {
  const [proposals, setProposals] = useState<AnimatedProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AnimatedProposalStatus | "all">("all");

  async function load() {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const { data } = await axios.get(`/api/animated-proposals${params}`);
      setProposals(data.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter]);

  const statuses: Array<AnimatedProposalStatus | "all"> = [
    "all", "draft", "pending_approval", "approved", "sent", "client_signed", "counter_signed", "paid",
  ];

  return (
    <div className="theme-animated min-h-screen px-6 md:px-10 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Animated Proposals</h1>
            <p className="opacity-40 text-sm mt-1">Personalized proposal websites</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-[var(--r-pill)] text-xs font-medium transition-colors"
              style={
                statusFilter === s
                  ? { background: "var(--accent)", color: "var(--bg)" }
                  : { background: "var(--muted)", color: "var(--fg)", opacity: 0.7 }
              }
            >
              {s === "all" ? "All" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner />
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-24 opacity-40">
            No animated proposals yet.
            <br />
            <span className="text-sm">
              Use Claude Code skill{" "}
              <code className="bg-(--muted) px-1 rounded-[var(--r-chip)]">/animated-proposal-xma</code>
              {" "}to create one.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[color:var(--border)] opacity-40 text-xs uppercase tracking-wide">
                  <th className="text-left py-3 pr-4">Client / Company</th>
                  <th className="text-left py-3 pr-4">Project</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3 pr-4">Value</th>
                  <th className="text-left py-3 pr-4">Created</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id} className="border-b border-[color:var(--border)] hover:bg-(--muted) transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{p.client_full_name}</p>
                      <p className="opacity-40 text-xs">{p.company_name}</p>
                    </td>
                    <td className="py-3 pr-4 max-w-xs">
                      <p className="truncate">{p.project_title}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="py-3 pr-4 font-mono">
                      {fmt(p.total_price_cents, p.currency)}
                    </td>
                    <td className="py-3 pr-4 opacity-40">
                      {format(new Date(p.created_at), "dd MMM yyyy")}
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/animated-proposals/${p.id}`}
                        className="text-xs font-medium transition-colors"
                        style={{ color: "var(--accent)" }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
