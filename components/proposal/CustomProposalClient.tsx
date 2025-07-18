"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomClientInformationForm from "./CustomClientInformationForm";
import CustomServiceForm from "./CustomServiceForm";
import CustomProposalSummary from "./CustomProposalSummary";
import CustomTermsForm from "./CustomTermsForm";
import ToSSelection from "./ToSSelection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/design-card";

export type PaymentType = "monthly" | "fixed";

export interface CustomService {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  paymentType: PaymentType;
  isMainService?: boolean;
}

export interface CustomProposalData {
  clientInfo: {
    clientName: string;
    companyName: string;
    proposalDate: string;
    additionalInfo?: string;
  };
  services: CustomService[];
  discount: number;
  discountType: "percentage" | "absolute";
  taxIncluded: boolean;
  terms: "standard" | "custom" | string; // Can be template ID or "custom"
  customTerms: string[];
}

export default function CustomProposalClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [proposalData, setProposalData] = useState<CustomProposalData>({
    clientInfo: {
      clientName: "",
      companyName: "",
      proposalDate: new Date().toISOString().split("T")[0],
      additionalInfo: "",
    },
    services: [],
    discount: 0,
    discountType: "percentage",
    taxIncluded: true,
    terms: "",
    customTerms: [],
  });

  const handleClientInfoChange = (clientInfo: CustomProposalData["clientInfo"]) => {
    setProposalData((prev) => ({ ...prev, clientInfo }));
  };

  const handleAddService = (service: CustomService) => {
    setProposalData((prev) => ({
      ...prev,
      services: [...prev.services, service],
    }));
  };

  const handleUpdateService = (id: string, service: CustomService) => {
    setProposalData((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? service : s)),
    }));
  };

  const handleRemoveService = (id: string) => {
    setProposalData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  };

  const handleDiscountChange = (discount: number, discountType: "percentage" | "absolute") => {
    setProposalData((prev) => ({ ...prev, discount, discountType }));
  };

  const handleTaxChange = (taxIncluded: boolean) => {
    setProposalData((prev) => ({ ...prev, taxIncluded }));
  };

  const handleTermsChange = (terms: "standard" | "custom" | string, customTerms: string[] = []) => {
    setProposalData((prev) => ({ ...prev, terms, customTerms }));
  };

  const handleSubmit = async () => {
    console.log("Validation check:", {
      clientName: proposalData.clientInfo.clientName,
      companyName: proposalData.clientInfo.companyName,
      proposalData: proposalData
    });
    
    if (!proposalData.clientInfo.clientName || !proposalData.clientInfo.companyName) {
      alert("Please fill in all client information");
      return;
    }

    if (proposalData.services.length === 0) {
      alert("Please add at least one service");
      return;
    }

    if (!proposalData.terms) {
      alert("Please select terms and conditions for your proposal");
      return;
    }

    if (proposalData.terms === "custom" && proposalData.customTerms.length === 0) {
      alert("Please add at least one custom term or condition");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/proposals/custom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposalData),
      });

      if (!response.ok) {
        throw new Error("Failed to create proposal");
      }

      const { proposalUrl } = await response.json();
      router.push(proposalUrl);
    } catch (error) {
      console.error("Error creating proposal:", error);
      alert("Failed to create proposal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Client Information</h2>
          <CustomClientInformationForm
            clientInfo={proposalData.clientInfo}
            onChange={handleClientInfoChange}
          />
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Custom Services</h2>
          <CustomServiceForm
            services={proposalData.services}
            onAddService={handleAddService}
            onUpdateService={handleUpdateService}
            onRemoveService={handleRemoveService}
          />
        </Card>

        <ToSSelection
          selectedPackageId={null} // Custom proposals don't have package dependencies
          selectedToS={proposalData.terms}
          setSelectedToS={(terms) => handleTermsChange(terms, proposalData.customTerms)}
          customTerms={proposalData.customTerms}
          setCustomTerms={(customTerms) => handleTermsChange(proposalData.terms, customTerms)}
        />
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <CustomProposalSummary
            proposalData={proposalData}
            onDiscountChange={handleDiscountChange}
            onTaxChange={handleTaxChange}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || proposalData.services.length === 0}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Creating..." : "Create Proposal"}
          </Button>
        </div>
      </div>
    </div>
  );
}
