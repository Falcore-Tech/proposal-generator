import React from "react";
import { getProposalTerms, formatTermsForDisplay } from "@/lib/tos-helpers";
import TermsAndConditions from "./TermsAndConditions";

interface ProposalTermsSectionProps {
  proposalData: any;
}

const ProposalTermsSection: React.FC<ProposalTermsSectionProps> = ({ proposalData }) => {
  const proposalTerms = getProposalTerms(proposalData);
  const formattedTerms = formatTermsForDisplay(proposalTerms);

  if (formattedTerms.length > 0) {
    return (
      <div className="mb-8 rounded-lg p-6 shadow-lg bg-(--card)">
        <h2 className="text-xl font-bold mb-4 text-(--primary)">Terms &amp; Conditions</h2>
        <div className="bg-(--background)/50 p-5 rounded-lg">
          <ol className="space-y-3 text-sm text-(--foreground)">
            {formattedTerms.map((term, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-3 font-semibold text-(--primary)">{index + 1}.</span>
                <div className="leading-relaxed">
                  {term.title && <span className="font-medium">{term.title}:</span>}
                  {term.title && " "}
                  <span>{term.content}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }
  
  // Check if this is a legacy proposal that should show hardcoded terms
  const hasToSData = proposalData.tos_template_id || proposalData.tos_snapshot || 
                    (proposalData.proposal_data && proposalData.proposal_data.selectedToS) ||
                    (proposalData.proposal_data && proposalData.proposal_data.customTerms && proposalData.proposal_data.customTerms.length > 0) ||
                    proposalData.selectedToS || proposalData.customTerms;
  
  // For proposals created before July 18, 2025 (when ToS system was implemented)
  // that don't have ToS data, show the hardcoded terms
  const proposalDate = new Date(proposalData.created_at || proposalData.proposalDate || '2025-07-18');
  const tosSystemDate = new Date('2025-07-18');
  const isLegacyProposal = proposalDate < tosSystemDate;
  
  if (!hasToSData && isLegacyProposal) {
    return <TermsAndConditions />;
  }
  
  // For new proposals without ToS selection, show nothing
  return null;
};

export default ProposalTermsSection;