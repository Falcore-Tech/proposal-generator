import { notFound } from "next/navigation";
import { AnimatedProposalView } from "./_components/AnimatedProposalView";
import {
  DEFAULT_THEME_ID,
  isThemeId,
  resolveThemeId,
  type ThemeId,
} from "./_components/_lib/themes";
import { createClient } from "@/utils/supabase/server";
import type { AnimatedProposal } from "@/types/animated-proposal";
import type { Metadata } from "next";
import { fetchPublicProposal } from "./_lib/fetch-public-proposal";

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ preview?: string; theme?: string; themes?: string }>;
}

async function fetchGlobalTheme(): Promise<ThemeId> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("app_settings" as any)
      .select("proposal_theme")
      .eq("id", true)
      .single();
    return resolveThemeId((data as { proposal_theme?: string } | null)?.proposal_theme);
  } catch {
    return DEFAULT_THEME_ID;
  }
}

async function fetchPreview(token: string): Promise<AnimatedProposal | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
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
  const proposal = await fetchPublicProposal(token);
  if (!proposal) return { title: "Proposal", robots: { index: false } };
  const titleMentionsCompany = proposal.project_title.toLowerCase().includes(proposal.company_name.toLowerCase());
  const title = titleMentionsCompany ? proposal.project_title : `${proposal.project_title} — ${proposal.company_name}`;
  const description = proposal.intro_paragraph.slice(0, 160);
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/proposal/${token}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AnimatedProposalPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { preview, theme, themes } = await searchParams;

  if (process.env.NEXT_PUBLIC_ANIMATED_ENABLED === "false") notFound();

  const isPreview = preview === "1";
  const proposal = isPreview
    ? await fetchPreview(token)
    : await fetchPublicProposal(token);

  if (!proposal) notFound();

  const queryThemeId = isThemeId(theme) ? theme : null;
  const showSwitcher = isPreview || themes === "1";

  const globalTheme = await fetchGlobalTheme();
  const initialThemeId =
    queryThemeId ??
    (isThemeId(proposal.theme) ? proposal.theme : null) ??
    globalTheme;

  return (
    <AnimatedProposalView
      proposal={proposal}
      showSwitcher={showSwitcher}
      initialThemeId={initialThemeId}
      queryLocked={queryThemeId !== null}
    />
  );
}
