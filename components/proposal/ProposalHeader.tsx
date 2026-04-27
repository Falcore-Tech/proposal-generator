import React from "react";

interface ProposalHeaderProps {
  clientName: string;
  companyName: string;
  proposalDate: string;
  orderId?: string;
  isXmaMedia?: boolean;
}

const ProposalHeader: React.FC<ProposalHeaderProps> = ({
  clientName,
  companyName,
  proposalDate,
  orderId,
  isXmaMedia = false,
}) => {
  const cardBg = isXmaMedia ? "bg-(--brand-muted)" : "bg-zinc-800";
  const borderTop = isXmaMedia ? "border-t-4 border-(--brand-accent)" : "border-t-4 border-red-500";
  const dividerBorder = isXmaMedia ? "border-(--brand-border)" : "border-zinc-700";
  const headingGradient = isXmaMedia
    ? "text-(--brand-accent)"
    : "bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent";
  const subText = isXmaMedia ? "text-(--brand-muted-fg)" : "text-zinc-400";
  const accentText = isXmaMedia ? "text-(--brand-fg) font-medium" : "text-white font-medium";
  const badgeBg = isXmaMedia
    ? "bg-(--brand-accent)/20 text-(--brand-accent)"
    : "bg-red-600/20 text-red-400";
  const cellBg = isXmaMedia ? "bg-(--brand-bg) hover:bg-white/30" : "bg-zinc-900/50 hover:bg-zinc-900";
  const labelText = isXmaMedia ? "text-(--brand-muted-fg)" : "text-zinc-400";
  const valueText = isXmaMedia ? "text-(--brand-fg)" : "text-white";

  return (
    <div className="mb-8">
      <div className={`${cardBg} rounded-lg p-6 shadow-lg ${borderTop}`}>
        <div className={`mb-8 text-center pb-6 border-b ${dividerBorder}`}>
          <img
            src={isXmaMedia ? "/XMA-01.png" : "/XMA-White.svg"}
            alt={isXmaMedia ? "XMA Media Logo" : "XMA Agency Logo"}
            className="h-12 mx-auto mb-6"
          />
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${headingGradient}`}>
            {isXmaMedia ? "XMA MEDIA PROPOSAL" : "MARKETING PROPOSAL"}
          </h1>
          <p className={`text-lg ${subText}`}>
            Prepared exclusively for{" "}
            <span className={accentText}>{companyName}</span>
          </p>

          {orderId && (
            <div className={`mt-3 inline-block text-sm font-medium px-3 py-1 rounded ${badgeBg}`}>
              Order ID: {orderId}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${cellBg} p-4 rounded-lg transition-colors`}>
            <p className={`text-sm ${labelText}`}>Client Name:</p>
            <p className={`font-medium text-lg ${valueText}`}>{clientName}</p>
          </div>
          <div className={`${cellBg} p-4 rounded-lg transition-colors`}>
            <p className={`text-sm ${labelText}`}>Company:</p>
            <p className={`font-medium text-lg ${valueText}`}>{companyName}</p>
          </div>
          <div className={`${cellBg} p-4 rounded-lg transition-colors`}>
            <p className={`text-sm ${labelText}`}>Proposal Date:</p>
            <p className={`font-medium text-lg ${valueText}`}>{proposalDate}</p>
          </div>
          {orderId && (
            <div className={`${cellBg} p-4 rounded-lg transition-colors`}>
              <p className={`text-sm ${labelText}`}>Order ID:</p>
              <p className={`font-medium text-lg ${valueText}`}>{orderId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalHeader;
