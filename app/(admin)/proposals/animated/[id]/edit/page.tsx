"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import { commonClasses } from "@/lib/design-system";
import { AnimatedProposalForm } from "@/components/proposal/AnimatedProposalForm";
import type { AnimatedProposal } from "@/types/animated-proposal";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditAnimatedProposalPage() {
  const { id } = useParams<{ id: string }>();
  const [proposal, setProposal] = useState<AnimatedProposal | null>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [tosTemplates, setTosTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [proposalRes, packagesRes, tosRes] = await Promise.all([
          axios.get(`/api/animated-proposals/${id}`),
          supabase.from("packages").select("id, name, price, currency, usd_price, brand").order("name"),
          supabase.from("tos_templates" as any).select("id, name, brand, terms").order("name"),
        ]);

        setProposal(proposalRes.data);
        setPackages(packagesRes.data ?? []);
        setTosTemplates((tosRes as any).data ?? []);
      } catch {
        setError("Failed to load proposal");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className={`${commonClasses.pageContainer} flex items-center justify-center`}>
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className={commonClasses.pageContainer}>
        <div className={commonClasses.contentContainer}>
          <p className="text-semantic-error">{error ?? "Proposal not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={commonClasses.pageContainer}>
      <div className={commonClasses.contentContainer}>
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/proposals/animated/${id}`} className="text-text-muted hover:text-text-primary transition-colors flex items-center gap-2">
            <ArrowLeft size={16} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Animated Proposal</h1>
            <p className="text-text-muted text-sm mt-1">{proposal.company_name} — {proposal.project_title}</p>
          </div>
        </div>

        <AnimatedProposalForm
          proposal={proposal}
          packages={packages}
          tosTemplates={tosTemplates}
        />
      </div>
    </div>
  );
}
