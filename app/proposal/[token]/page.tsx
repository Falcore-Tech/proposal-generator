import { notFound } from "next/navigation";
import { AnimatedProposalView } from "./_components/AnimatedProposalView";
import { createClient } from "@/utils/supabase/server";
import type { AnimatedProposal } from "@/types/animated-proposal";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ preview?: string }>;
}

async function fetchPublic(token: string): Promise<AnimatedProposal | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/animated-proposals/public/${token}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function fetchPreview(token: string): Promise<AnimatedProposal | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await (supabase as any)
    .from("animated_proposals")
    .select("*")
    .eq("token", token)
    .is("archived_at", null)
    .single();
  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const proposal = await fetchPublic(token);
  if (!proposal) return { title: "Proposal" };
  return {
    title: `${proposal.project_title} — ${proposal.company_name}`,
    description: proposal.intro_paragraph.slice(0, 160),
  };
}

export default async function AnimatedProposalPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { preview } = await searchParams;

  if (process.env.NEXT_PUBLIC_ANIMATED_ENABLED === "false") notFound();

  const proposal = preview === "1"
    ? await fetchPreview(token)
    : await fetchPublic(token);

  if (!proposal) notFound();

  return <AnimatedProposalView proposal={proposal} />;
}
