import React from "react";
import { Logo } from "@/components/Logo";

interface ProposalHeaderProps {
  clientName: string;
  companyName: string;
  proposalDate: string;
  orderId?: string;
}

const ProposalHeader: React.FC<ProposalHeaderProps> = ({
  clientName,
  companyName,
  proposalDate,
  orderId,
}) => {
  return (
    <div className="mb-8">
      <div className="bg-(--brand-muted) rounded-lg p-6 shadow-lg border-t-4 border-(--brand-accent)">
        <div className="mb-8 text-center pb-6 border-b border-(--brand-border)">
          <Logo
            showWordmark={false}
            size={48}
            className="justify-center mb-6"
            imageClassName="h-12 w-auto"
          />
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-(--brand-accent)">
            FALCORE PROPOSAL
          </h1>
          <p className="text-lg text-(--brand-muted-fg)">
            Prepared exclusively for{" "}
            <span className="text-(--brand-fg) font-medium">{companyName}</span>
          </p>

          {orderId && (
            <div className="mt-3 inline-block text-sm font-medium px-3 py-1 rounded bg-(--brand-accent)/20 text-(--brand-accent)">
              Order ID: {orderId}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-(--brand-bg) hover:bg-white/30 p-4 rounded-lg transition-colors">
            <p className="text-sm text-(--brand-muted-fg)">Client Name:</p>
            <p className="font-medium text-lg text-(--brand-fg)">{clientName}</p>
          </div>
          <div className="bg-(--brand-bg) hover:bg-white/30 p-4 rounded-lg transition-colors">
            <p className="text-sm text-(--brand-muted-fg)">Company:</p>
            <p className="font-medium text-lg text-(--brand-fg)">{companyName}</p>
          </div>
          <div className="bg-(--brand-bg) hover:bg-white/30 p-4 rounded-lg transition-colors">
            <p className="text-sm text-(--brand-muted-fg)">Proposal Date:</p>
            <p className="font-medium text-lg text-(--brand-fg)">{proposalDate}</p>
          </div>
          {orderId && (
            <div className="bg-(--brand-bg) hover:bg-white/30 p-4 rounded-lg transition-colors">
              <p className="text-sm text-(--brand-muted-fg)">Order ID:</p>
              <p className="font-medium text-lg text-(--brand-fg)">{orderId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalHeader;
