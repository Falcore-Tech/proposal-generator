"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import ClientInformationForm from "./ClientInformationForm";
import PackageSelection from "./PackageSelection";
import ToSSelection from "./ToSSelection";
import GeneratorSummary from "./GeneratorSummary";
import ProposalSuccess from "./ProposalSuccess";
import { CURRENCIES, CurrencyOption } from "@/lib/useCurrencyRates";

// Main Component
function ProposalForm({
  initialData,
  editMode = false,
  existingProposal = null,
  onSubmit = null,
}) {
  const [includeTax, setIncludeTax] = useState(
    existingProposal?.includeTax ?? true,
  );
  // Use React Query with initialData
  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*, features:package_features(*)")
        .order("price");

      if (error) {
        console.error("Error fetching packages:", error);
        throw error;
      }
      return data || [];
    },
    initialData: initialData?.packages || [],
  });


  // State for form inputs
  const [clientName, setClientName] = useState(
    existingProposal?.clientName || "",
  );
  const [companyName, setCompanyName] = useState(
    existingProposal?.companyName || "",
  );
  const [proposalDate, setProposalDate] = useState(
    existingProposal?.proposalDate || new Date().toISOString().split("T")[0],
  );
  const [additionalInfo, setAdditionalInfo] = useState(
    existingProposal?.additionalInfo || "",
  );
  const [selectedPackageId, setSelectedPackageId] = useState(
    existingProposal?.selectedPackage?.id || null,
  );
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(
    CURRENCIES.find(c => c.code === existingProposal?.currency) ?? CURRENCIES[0]
  );
  const [showProposal, setShowProposal] = useState(false);
  const [proposalLink, setProposalLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [includePackage, setIncludePackage] = useState(
    existingProposal?.includePackage ?? true,
  );
  const [discounts, setDiscounts] = useState(
    existingProposal?.discounts || {
      packageDiscount: { type: "percentage", value: 0 },
      serviceDiscounts: {},
      overallDiscount: { type: "percentage", value: 0 },
    },
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [validityDays, setValidityDays] = useState(
    existingProposal?.validityDays || 30,
  );
  
  // ToS state
  const [selectedToS, setSelectedToS] = useState(
    existingProposal?.selectedToS || ""
  );
  const [customTerms, setCustomTerms] = useState(
    existingProposal?.customTerms || []
  );

  // Set default selected package when packages are loaded
  useEffect(() => {
    if (
      packagesQuery.isSuccess &&
      packagesQuery.data &&
      packagesQuery.data.length > 0 &&
      !selectedPackageId
    ) {
      const standardPackage = packagesQuery.data.find((p) => p.name === "Standard");
      const defaultPackage = standardPackage || packagesQuery.data[1] || packagesQuery.data[0];
      if (defaultPackage) setSelectedPackageId(defaultPackage.id);
    }
  }, [packagesQuery.isSuccess, packagesQuery.data, selectedPackageId]);

  // Handle discount changes (universal handler)
  const handleDiscountChange = (
    type,
    id,
    value,
    discountType = "percentage",
  ) => {
    if (type === "package") {
      setDiscounts((prev) => ({
        ...prev,
        packageDiscount: {
          type: discountType,
          value:
            value > (discountType === "percentage" ? 100 : Infinity)
              ? discountType === "percentage"
                ? 100
                : value
              : value,
        },
      }));
    } else if (type === "service") {
      if (id !== null) {
        setDiscounts((prev) => ({
          ...prev,
          serviceDiscounts: {
            ...prev.serviceDiscounts,
            [id]: {
              type: discountType,
              value:
                value > (discountType === "percentage" ? 100 : Infinity)
                  ? discountType === "percentage"
                    ? 100
                    : value
                  : value,
            },
          },
        }));
      }
    } else if (type === "overall") {
      setDiscounts((prev) => ({
        ...prev,
        overallDiscount: {
          type: discountType,
          value:
            value > (discountType === "percentage" ? 100 : Infinity)
              ? discountType === "percentage"
                ? 100
                : value
              : value,
        },
      }));
    }
  };

  const generateProposal = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);

    // Validate that a package is selected
    if (!includePackage || !selectedPackageId) {
      alert("Please select a package for your proposal.");
      setIsSaving(false);
      return;
    }

    // Validate that ToS is selected
    if (!selectedToS) {
      alert("Please select terms and conditions for your proposal.");
      setIsSaving(false);
      return;
    }

    // Validate custom terms if selected
    if (selectedToS === "custom" && customTerms.length === 0) {
      alert("Please add at least one custom term or condition.");
      setIsSaving(false);
      return;
    }

    // If in edit mode and custom onSubmit provided, use it
    if (editMode && onSubmit) {
      const formData = {
        clientName,
        companyName,
        proposalDate,
        additionalInfo,
        includePackage,
        selectedPackageId,
        selectedServices: [],
        discounts,
        includeTax,
        validityDays,
      };

      try {
        await onSubmit(formData);
      } catch (error) {
        setSaveError(error.message || "Failed to update proposal");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    try {
      // Get the selected package
      const selectedPackage = packagesQuery.data.find(
        (p) => p.id === selectedPackageId,
      );

      // Find the index of the selected package in the array (for backward compatibility)
      const selectedPackageIndex = packagesQuery.data.findIndex(
        (p) => p.id === selectedPackageId,
      );

      // Create the proposal data object with full snapshots
      const proposalDataWithSnapshots = {
        clientName,
        companyName,
        proposalDate,
        additionalInfo,
        includePackage,
        selectedPackage: includePackage ? selectedPackage : null,
        selectedPackageIndex: includePackage ? selectedPackageIndex : null,
        selectedServices: [],
        discounts,
        includeTax,
        validityDays,
        selectedToS,
        customTerms,
        currency: selectedCurrency.code,
      };

      // First try to get or create the client
      const { data: existingClient } = await supabase
        .from("clients")
        .select()
        .eq("company_name", companyName)
        .maybeSingle();

      let clientId;

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert({
            name: clientName,
            company_name: companyName,
            email: null,
          })
          .select()
          .single();

        if (clientError) {
          throw clientError;
        }

        clientId = newClient.id;
      }

      // Save the proposal via API route (which handles order ID generation and created_by)
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalData: {
            clientName,
            companyName,
            proposalDate,
            additionalInfo,
            includePackage,
            selectedPackageId,
            packageDiscountType: discounts.packageDiscount.type,
            packageDiscountValue: discounts.packageDiscount.value,
            overallDiscountType: discounts.overallDiscount.type,
            overallDiscountValue: discounts.overallDiscount.value,
            includeTax,
            validityDays,
            selectedServices: [],
            selectedPackage: includePackage ? selectedPackage : null,
            selectedPackageIndex: includePackage ? selectedPackageIndex : null,
            discounts,
            selectedToS,
            customTerms,
            currency: selectedCurrency.code,
          },
          encodedData: btoa(encodeURIComponent(JSON.stringify(proposalDataWithSnapshots))),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create proposal");
      }

      const result = await response.json();
      const proposal = result.proposal;

      // API route already handled link creation, just use the returned link
      setProposalLink(proposal.link);
      setShowProposal(true);
    } catch (error) {
      console.error("Error saving proposal:", error);
      setSaveError(error.message || "Failed to save proposal to database");
    } finally {
      setIsSaving(false);
    }
  };

  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(proposalLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
  };

  // Back to generator
  const backToGenerator = () => {
    setShowProposal(false);
    setProposalLink("");
  };

  // Loading state
  if (packagesQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4"></div>
          <p className="text-zinc-400">Loading packages and services...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (packagesQuery.isError) {
    const error = packagesQuery.error;
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-zinc-400 mb-4">{error.message}</p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mr-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (packagesQuery.data.length === 0 && !showProposal) {
    return (
      <div className="min-h-screen pt-40 flex items-center justify-center text-white">
        <div className="text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-zinc-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h2 className="text-xl font-bold text-zinc-300 mb-2">No Packages Found</h2>
          <p className="text-zinc-400 mb-6">
            Please contact your administrator to set up the necessary packages.
          </p>
        </div>
      </div>
    );
  }

  // Get the selected package
  const selectedPackage =
    packagesQuery.data.find((p) => p.id === selectedPackageId) || null;

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto">
        {!showProposal ? (
          // Proposal Generator Form
          <form onSubmit={generateProposal} className="">
            {/* Client Information */}
            <ClientInformationForm
              clientName={clientName}
              setClientName={setClientName}
              companyName={companyName}
              setCompanyName={setCompanyName}
              proposalDate={proposalDate}
              setProposalDate={setProposalDate}
              additionalInfo={additionalInfo}
              setAdditionalInfo={setAdditionalInfo}
              validityDays={validityDays}
              setValidityDays={setValidityDays}
            />

            {/* Package Selection */}
            <PackageSelection
              packages={packagesQuery.data}
              selectedPackageId={selectedPackageId}
              setSelectedPackageId={setSelectedPackageId}
              includePackage={includePackage}
              setIncludePackage={setIncludePackage}
              selectedCurrency={selectedCurrency}
              setSelectedCurrency={setSelectedCurrency}
            />

            {/* Terms & Conditions Selection */}
            <ToSSelection
              selectedPackageId={selectedPackageId}
              selectedToS={selectedToS}
              setSelectedToS={setSelectedToS}
              customTerms={customTerms}
              setCustomTerms={setCustomTerms}
            />

            {/* Summary and Discounts Section */}
            {includePackage && selectedPackage && (
              <GeneratorSummary
                includePackage={includePackage}
                selectedPackage={selectedPackage}
                selectedServices={[]}
                discounts={discounts}
                includeTax={includeTax}
                onDiscountChange={handleDiscountChange}
                onTaxToggle={setIncludeTax}
              />
            )}

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {editMode
                      ? "Updating Proposal..."
                      : "Generating Proposal..."}
                  </div>
                ) : editMode ? (
                  "Update Proposal"
                ) : (
                  "Generate Proposal"
                )}
              </button>
              {saveError && (
                <div className="mt-2 text-red-500 text-sm">
                  Error: {saveError}
                </div>
              )}
            </div>
          </form>
        ) : (
          // Proposal Success View
          <ProposalSuccess
            proposalLink={proposalLink}
            linkCopied={linkCopied}
            copyLinkToClipboard={copyLinkToClipboard}
            backToGenerator={backToGenerator}
            clientName={clientName}
            companyName={companyName}
            proposalDate={proposalDate}
            includePackage={includePackage}
            selectedPackage={selectedPackage}
            selectedServices={[]}
          />
        )}
      </div>
    </div>
  );
}

export default ProposalForm;
