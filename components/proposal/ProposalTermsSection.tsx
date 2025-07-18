import React from "react";
import { getProposalTerms, formatTermsForDisplay } from "@/lib/tos-helpers";
import TermsAndConditions from "./TermsAndConditions";

interface ProposalTermsSectionProps {
  proposalData: any;
}

const ProposalTermsSection: React.FC<ProposalTermsSectionProps> = ({ proposalData }) => {
  const proposalTerms = getProposalTerms(proposalData);
  const formattedTerms = formatTermsForDisplay(proposalTerms);
  
  // If we have terms from the new ToS system, display them
  if (formattedTerms.length > 0) {
    return (
      <div className="mb-8 bg-zinc-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-red-500">Terms & Conditions</h2>
        <div className="bg-zinc-900/50 p-5 rounded-lg">
          <ol className="space-y-3 text-zinc-300 text-sm">
            {formattedTerms.map((term, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-3 font-semibold">{index + 1}.</span>
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