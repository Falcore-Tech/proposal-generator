"use client";

import React, { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ProposalPDF from "./PrintableProposalPDF";

interface PrintButtonProps {
  proposalData: any;
  orderId?: string | null;
  status?: string;
}

const PrintButton: React.FC<PrintButtonProps> = ({
  proposalData,
  orderId,
  status,
}) => {
  const btnClass = "bg-(--brand-fg) text-(--brand-bg) hover:opacity-80";
  const [isClient, setIsClient] = useState(false);

  // Check if we're in the browser environment
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Server-side rendering fallback
    return (
      <button
        className={`${btnClass} px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2 transition-colors shadow-sm`}
        disabled
      >
        <FileDown size={18} />
        <span>Download Contract</span>
      </button>
    );
  }

  // Format file name based on company name
  const companyName = proposalData.isCustomProposal 
    ? proposalData.clientInfo?.companyName 
    : proposalData.companyName;
  const fileName = `Falcore_Proposal_${companyName?.replace(/\s+/g, "_") || "Unknown"}.pdf`;

  return (
    <PDFDownloadLink
      document={
        <ProposalPDF
          proposalData={proposalData}
          orderId={orderId}
          status={status}
        />
      }
      fileName={fileName}
      className="no-underline"
    >
      {({ blob, url, loading, error }) => {
        // Log any error to console for debugging
        if (error) {
          console.error("PDF Generation Error:", error);
        }

        return (
          <button
            type="button"
            disabled={loading}
            className={`${btnClass} px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 cursor-pointer`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileDown size={18} />
                <span>Download Contract (PDF)</span>
              </>
            )}
          </button>
        );
      }}
    </PDFDownloadLink>
  );
};

export default PrintButton;
