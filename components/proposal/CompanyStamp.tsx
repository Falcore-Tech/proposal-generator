import Image from "next/image";
import React from "react";

interface CompanyStampProps {
  orderId?: string | null;
  isXmaMedia?: boolean;
}

const CompanyStamp: React.FC<CompanyStampProps> = ({ orderId, isXmaMedia = false }) => {
  const borderColor = isXmaMedia ? "border-[var(--primary)]/20" : "border-zinc-700";
  const headingColor = isXmaMedia ? "text-[var(--foreground)]" : "text-white";
  const bodyColor = isXmaMedia ? "text-[var(--foreground)]/70" : "text-zinc-300";
  const strongColor = isXmaMedia ? "text-[var(--foreground)]" : "text-white";
  const orderIdColor = isXmaMedia ? "text-[var(--primary)]" : "text-red-400";
  const stampBg = isXmaMedia ? "bg-white" : "bg-zinc-300";
  const captionColor = isXmaMedia ? "text-[var(--foreground)]/40" : "text-zinc-500";
  const footerColor = isXmaMedia ? "text-[var(--foreground)]/40" : "text-zinc-400";

  return (
    <div className={`mt-6 pt-4 border-t ${borderColor}`}>
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 md:mr-4 md:max-w-md">
          <h3 className={`text-md font-bold mb-3 ${headingColor}`}>Legal Agreement</h3>
          <div className={`text-sm ${bodyColor}`}>
            <p>
              By accepting this proposal, the client agrees to enter into a legally binding contract
              with {isXmaMedia ? "XMA Media" : "xluxive digital marketing LLC"} under Order ID:{" "}
              <span className={`font-semibold ${orderIdColor}`}>{orderId || "N/A"}</span>.
              This document serves as the official agreement between both parties and is subject
              to the terms and conditions outlined herein.
            </p>
            <p className="mt-2">
              <strong className={strongColor}>Payment Acceptance:</strong> Receipt of payment for this proposal
              constitutes full acceptance of all terms and conditions. Once payment is received,
              work will commence according to the agreed timeline.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className={`${stampBg} p-2 rounded-lg`}>
            <Image
              src="/xma-company-stamp.png"
              alt="Company Stamp"
              className="w-48 max-w-full h-auto"
              width={1000}
              height={500}
            />
          </div>
          <p className={`mt-2 text-xs ${captionColor}`}>Official Company Stamp</p>
        </div>
      </div>

      <p className={`mt-4 text-xs text-center ${footerColor}`}>
        This document is electronically generated and valid without signature.
        The Order ID serves as the unique identifier for this contract.
      </p>
    </div>
  );
};

export default CompanyStamp;
