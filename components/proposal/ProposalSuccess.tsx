"use client";

import React from "react";
import Link from "next/link";

interface ProposalSuccessProps {
  proposalLink: string;
  linkCopied: boolean;
  copyLinkToClipboard: () => void;
  backToGenerator: () => void;
  clientName: string;
  companyName: string;
  proposalDate: string;
  includePackage: boolean;
  selectedPackage: any;
  selectedServices: any[];
}

const ProposalSuccess: React.FC<ProposalSuccessProps> = ({
  proposalLink,
  linkCopied,
  copyLinkToClipboard,
  backToGenerator,
  clientName,
  companyName,
  proposalDate,
  includePackage,
  selectedPackage,
  selectedServices,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
          Proposal Created Successfully
        </h1>
        <p className="text-zinc-400 mt-2">
          Your proposal has been saved to the database and is ready to share
        </p>
      </div>

      {/* Shareable Link Section */}
      <div className="mb-8 bg-zinc-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4 text-red-500">
          Proposal Link
        </h3>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-2">
            <input
              type="text"
              value={proposalLink}
              readOnly
              className="flex-grow bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-white focus:outline-none w-full md:w-auto"
            />
            <button
              onClick={copyLinkToClipboard}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors whitespace-nowrap w-full md:w-auto"
            >
              {linkCopied ? "Copied!" : "Copy Link"}
            </button>
          </div>

          <div className="mt-4 text-sm text-zinc-400">
            <p>
              Share this link with your client. They can view the proposal
              without needing to create an account.
            </p>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <a
              href={proposalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md transition-colors text-center"
            >
              Open in New Tab
            </a>
            <button
              onClick={() => {
                // Create a direct email link with subject and body
                const subject = encodeURIComponent(
                  `Marketing Proposal for ${companyName}`
                );
                const body = encodeURIComponent(
                  `Dear ${clientName},\n\nThank you for your interest in Falcore. We've prepared a custom marketing proposal for ${companyName}.\n\nYou can view your proposal here: ${proposalLink}\n\nPlease let us know if you have any questions.\n\nBest regards,\nFalcore Team`
                );
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
              }}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-md transition-colors text-center"
            >
              Email This Link
            </button>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-zinc-800 rounded-lg p-6 mb-8">
        <div className="mb-4 text-center">
          <img
            src="/logo-transparent.webp"
            alt="Falcore Logo"
            className="h-10 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-red-500">
            Proposal Summary
          </h2>
        </div>

        {/* Client Information */}
        <div className="mb-6 pb-6 border-b border-zinc-700">
          <h3 className="text-lg font-bold mb-2 text-red-500">
            Client Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 p-3 rounded-lg">
              <p className="text-sm text-zinc-400">Name:</p>
              <p className="font-medium">{clientName}</p>
            </div>
            <div className="bg-zinc-900/50 p-3 rounded-lg">
              <p className="text-sm text-zinc-400">Company:</p>
              <p className="font-medium">{companyName}</p>
            </div>
            <div className="bg-zinc-900/50 p-3 rounded-lg">
              <p className="text-sm text-zinc-400">Date:</p>
              <p className="font-medium">{proposalDate}</p>
            </div>
          </div>
        </div>

        {/* Selected Packages and Services */}
        <div className="mb-6 pb-6 border-b border-zinc-700">
          <h3 className="text-lg font-bold mb-2 text-red-500">
            Proposal Contents
          </h3>
          <div className="space-y-3">
            {includePackage && selectedPackage && (
              <div className="bg-zinc-900/50 p-3 rounded-lg">
                <p className="text-sm text-zinc-400">Package:</p>
                <p className="font-medium">{selectedPackage.name}</p>
              </div>
            )}

            {selectedServices.length > 0 && (
              <div className="bg-zinc-900/50 p-3 rounded-lg">
                <p className="text-sm text-zinc-400">Services:</p>
                <ul className="mt-1 space-y-1">
                  {selectedServices.map((service) => (
                    <li key={service.id} className="font-medium">
                      {service.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-zinc-400">
            View the complete proposal by clicking the link above.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-12">
        <button
          onClick={backToGenerator}
          className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Create Another Proposal
        </button>

        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/proposals"
            className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 px-6 rounded-lg transition-colors text-center"
          >
            View All Proposals
          </Link>

          <Link
            href={proposalLink}
            target="_blank"
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors text-center"
          >
            View Full Proposal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProposalSuccess;
