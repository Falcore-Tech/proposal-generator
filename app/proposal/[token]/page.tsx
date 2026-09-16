import { notFound } from "next/navigation";
import { AnimatedProposalView } from "./_components/AnimatedProposalView";
import { isThemeId } from "./_components/_lib/themes";
import { and, eq, isNull } from "drizzle-orm";
import { db, animatedProposals } from "@/lib/db";
import { getGlobalTheme } from "@/lib/db/queries/settings";
import { getAuthUser } from "@/lib/auth/page";
import type { AnimatedProposal } from "@/types/animated-proposal";
import type { Metadata } from "next";
import { fetchPublicProposal } from "./_lib/fetch-public-proposal";

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ preview?: string; theme?: string; themes?: string }>;
}

async function fetchPreview(token: string): Promise<AnimatedProposal | null> {
  const user = await getAuthUser();
  if (!user) return null;
  const [row] = await db
    .select()
    .from(animatedProposals)
    .where(and(eq(animatedProposals.token, token), isNull(animatedProposals.archived_at)))
    .limit(1);
  return (row as unknown as AnimatedProposal | undefined) ?? null;
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

  const globalTheme = await getGlobalTheme();
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
