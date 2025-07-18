import { termsAndConditions } from "@/data/proposalData";
import { ToSTerm } from "@/types/tos";

/**
 * Get terms for a proposal, handling backward compatibility
 */
export function getProposalTerms(proposal: any): ToSTerm[] | string[] {
  // New system: proposal has tos_template_id and tos_snapshot
  if (proposal.tos_template_id && proposal.tos_snapshot) {
    return proposal.tos_snapshot;
  }

  // Check if proposal has tos_snapshot directly (for new proposals)
  if (proposal.tos_snapshot) {
    return proposal.tos_snapshot;
  }

  // Legacy system: check proposal_data
  if (proposal.proposal_data) {
    // Custom terms
    if (proposal.proposal_data.customTerms && proposal.proposal_data.customTerms.length > 0) {
      return proposal.proposal_data.customTerms;
    }
    
    // Check if this is a custom proposal with custom terms
    if (proposal.proposal_data.isCustomProposal && proposal.proposal_data.terms === 'custom') {
      return proposal.proposal_data.customTerms || [];
    }
    
    // Selected ToS template ID but no snapshot (shouldn't happen but handle gracefully)
    if (proposal.proposal_data.selectedToS && proposal.proposal_data.selectedToS !== 'custom') {
      return [];
    }
  }

  // Check direct properties for custom proposals
  if (proposal.customTerms && proposal.customTerms.length > 0) {
    return proposal.customTerms;
  }

  // No terms found - return empty array (let the component decide what to show)
  return [];
}

/**
 * Check if proposal uses new ToS system
 */
export function isNewToSSystem(proposal: any): boolean {
  return !!proposal.tos_template_id;
}

/**
 * Format terms for display (handles both old string format and new ToSTerm format)
 */
export function formatTermsForDisplay(terms: ToSTerm[] | string[]): Array<{ title: string; content: string }> {
  if (!terms || terms.length === 0) return [];

  // Check if it's the new format (ToSTerm[])
  if (typeof terms[0] === 'object' && 'title' in terms[0]) {
    return (terms as ToSTerm[])
      .sort((a, b) => a.order - b.order)
      .map(term => ({
        title: term.title,
        content: term.content
      }));
  }

  // Legacy format (string[])
  return (terms as string[]).map((term, index) => {
    // Extract number and content from strings like "1. Payment Terms: ..."
    const match = term.match(/^\d+\.\s*([^:]+):\s*(.+)$/);
    if (match) {
      return {
        title: match[1],
        content: match[2]
      };
    }
    
    // Fallback for terms without title
    return {
      title: `Term ${index + 1}`,
      content: term.replace(/^\d+\.\s*/, '')
    };
  });
}

/**
 * Convert ToS template terms to proposal snapshot
 */
export function createToSSnapshot(template: any): ToSTerm[] {
  if (!template || !template.terms) return [];
  
  // Apply any variables to the terms
  const terms = template.terms.map((term: ToSTerm) => {
    let content = term.content;
    
    // Replace variables if any exist
    if (template.variables) {
      Object.entries(template.variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      });
    }
    
    return {
      ...term,
      content
    };
  });
  
  return terms;
}