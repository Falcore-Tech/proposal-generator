import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { SITE_TITLE } from "@/lib/site";
import { fetchPublicProposal } from "./_lib/fetch-public-proposal";

export const alt = "Proposal preview";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

interface Props {
  params: Promise<{ token: string }>;
}

export default async function Image({ params }: Props) {
  const { token } = await params;
  const proposal = await fetchPublicProposal(token);

  if (!proposal) {
    return renderOgImage({ eyebrow: "Proposal", title: SITE_TITLE });
  }

  return renderOgImage({
    eyebrow: "Proposal",
    title: proposal.project_title,
    subtitle: `Prepared for ${proposal.client_full_name} · ${proposal.company_name}`,
    footer: `${proposal.provider_name} · ${proposal.agency_name}`,
  });
}
