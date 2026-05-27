import React from "react";
import {
  StyleSheet,
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
} from "@react-pdf/renderer";
import { formatPrice } from "@/lib/proposalUtils";
import contractStyle from "@/data/contractStyle";

// Create PDF Document Component
const ProposalPDF = ({ proposalData, orderId, status }) => {
  // Check if this is a custom proposal
  const isCustomProposal = proposalData.isCustomProposal || false;

  // Current date for signature
  const currentDate = new Date().toLocaleDateString();

  // Format dates
  const proposalDate = isCustomProposal 
    ? proposalData.clientInfo?.proposalDate 
    : proposalData.proposalDate;
  const formattedDate = new Date(proposalDate).toLocaleDateString();

  // Calculate expiration date (30 days from proposal date)
  const expDate = new Date(proposalDate);
  expDate.setDate(expDate.getDate() + 30);
  const expirationDate = expDate.toLocaleDateString();

  // Determine if proposal is expired
  const isExpired = new Date() > expDate;

  // Check if accepted or paid
  const isAcceptedOrPaid = ["accepted", "paid"].includes(
    status?.toLowerCase() || "",
  );

  // Calculate subtotal
  const calculateSubtotal = () => {
    // For custom proposals, use the pre-calculated values
    if (isCustomProposal && proposalData.calculations) {
      return proposalData.calculations.subtotal;
    }
    
    let subtotal = 0;

    // Add package price if included
    if (proposalData.includePackage && proposalData.selectedPackage) {
      const packagePrice = parseFloat(
        proposalData.selectedPackage.price.toString().replace(/,/g, ""),
      );

      // Apply package discount
      if (proposalData.discounts?.packageDiscount?.value > 0) {
        if (proposalData.discounts.packageDiscount.type === "percentage") {
          subtotal +=
            packagePrice *
            (1 - proposalData.discounts.packageDiscount.value / 100);
        } else {
          subtotal += Math.max(
            0,
            packagePrice - proposalData.discounts.packageDiscount.value,
          );
        }
      } else {
        subtotal += packagePrice;
      }
    }

    // Add services prices
    if (
      proposalData.selectedServices &&
      Array.isArray(proposalData.selectedServices)
    ) {
      proposalData.selectedServices.forEach((service) => {
        const servicePrice = parseFloat(
          service.price.toString().replace(/,/g, ""),
        );
        const serviceDiscount =
          proposalData.discounts?.serviceDiscounts?.[service.id];

        if (serviceDiscount && serviceDiscount.value > 0) {
          if (serviceDiscount.type === "percentage") {
            subtotal += servicePrice * (1 - serviceDiscount.value / 100);
          } else {
            subtotal += Math.max(0, servicePrice - serviceDiscount.value);
          }
        } else {
          subtotal += servicePrice;
        }
      });
    }

    return subtotal;
  };

  const subtotal = calculateSubtotal();

  // Calculate discount
  const calculateDiscountAmount = () => {
    // For custom proposals, use the pre-calculated values
    if (isCustomProposal && proposalData.calculations) {
      return proposalData.calculations.discountAmount;
    }
    
    if (!proposalData.discounts?.overallDiscount?.value) return 0;

    if (proposalData.discounts.overallDiscount.type === "percentage") {
      return subtotal * (proposalData.discounts.overallDiscount.value / 100);
    } else {
      return proposalData.discounts.overallDiscount.value;
    }
  };

  const discountAmount = calculateDiscountAmount();
  const subtotalAfterDiscount = subtotal - discountAmount;

  // Calculate tax
  const calculateTaxAmount = () => {
    // For custom proposals, use the pre-calculated values
    if (isCustomProposal && proposalData.calculations) {
      return proposalData.calculations.taxAmount;
    }
    
    return proposalData.includeTax !== false ? subtotalAfterDiscount * 0.05 : 0;
  };

  const taxAmount = calculateTaxAmount();

  // Calculate total
  const totalAmount = isCustomProposal && proposalData.calculations 
    ? proposalData.calculations.totalAmount 
    : subtotalAfterDiscount + taxAmount;

  // Check if there are monthly fees
  const hasMonthlyFees = () => {
    if (
      !proposalData.selectedServices ||
      !Array.isArray(proposalData.selectedServices)
    ) {
      return false;
    }

    return proposalData.selectedServices.some(
      (service) =>
        (service.monthly || service.is_monthly) &&
        (service.setupFee || service.setup_fee),
    );
  };

  // Calculate monthly fees
  const calculateMonthlyFees = () => {
    if (
      !proposalData.selectedServices ||
      !Array.isArray(proposalData.selectedServices)
    ) {
      return 0;
    }

    return proposalData.selectedServices.reduce((total, service) => {
      if (
        (service.monthly || service.is_monthly) &&
        (service.setupFee || service.setup_fee)
      ) {
        return (
          total +
          parseFloat(
            (service.setupFee || service.setup_fee)
              .toString()
              .replace(/,/g, ""),
          )
        );
      }
      return total;
    }, 0);
  };

  const monthlyFees = calculateMonthlyFees();

  // Compress features if needed
  const getFormattedFeatures = (features) => {
    if (!features || !Array.isArray(features) || features.length === 0)
      return null;

    // Sort by order_index or original order
    const sortedFeatures = [...features].sort(
      (a, b) => (a.order_index || 0) - (b.order_index || 0),
    );

    // Group features into two columns for larger feature sets
    if (sortedFeatures.length > 5) {
      const firstHalf = sortedFeatures.slice(
        0,
        Math.ceil(sortedFeatures.length / 2),
      );
      const secondHalf = sortedFeatures.slice(
        Math.ceil(sortedFeatures.length / 2),
      );

      return (
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, marginRight: 5 }}>
            {firstHalf.map((feature, index) => (
              <View style={contractStyle.featureItem} key={`a-${index}`}>
                <Text style={contractStyle.featureBullet}>•</Text>
                <Text
                  style={{
                    ...contractStyle.featureText,
                    ...(feature.is_bold ? { fontWeight: "bold" } : {}),
                  }}
                >
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            {secondHalf.map((feature, index) => (
              <View style={contractStyle.featureItem} key={`b-${index}`}>
                <Text style={contractStyle.featureBullet}>•</Text>
                <Text
                  style={{
                    ...contractStyle.featureText,
                    ...(feature.is_bold ? { fontWeight: "bold" } : {}),
                  }}
                >
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      );
    } else {
      // Regular single column layout for smaller feature sets
      return (
        <>
          {sortedFeatures.map((feature, index) => (
            <View style={contractStyle.featureItem} key={index}>
              <Text style={contractStyle.featureBullet}>•</Text>
              <Text
                style={{
                  ...contractStyle.featureText,
                  ...(feature.is_bold ? { fontWeight: "bold" } : {}),
                }}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </>
      );
    }
  };

  // Two column approach for terms
  const renderTermsCompact = () => {
    // First 5 terms in first column, remaining in second column
    const terms = [
      "Payment Terms: 100% payment required upfront to initiate the project.",
      "Revisions: Package includes up to 3 rounds of revisions for each deliverable.",
      "Timeline: Estimated completion time is 4-6 weeks from project start date, dependent on client feedback turnaround times.",
      "Content: Client is responsible for providing necessary content (brand asset, product information, account credentials etc.) within 3 days of project start.",
      "Intellectual Property: Upon full payment, client receives full rights to all deliverables created specifically for this project.",
      "Cancellation and Satisfaction Guarantee: We offer a satisfaction guarantee for up to one month after campaign launch. If dissatisfied, client may request a refund, but will forfeit content ownership rights and may no longer use the content for advertising or posting. For retainer cancellations, clients may keep the CRM system for a reduced fee of 300 AED per month.",
      "Confidentiality: Falcore agrees to maintain confidentiality of all client information.",
      "Additional Services: Any services not specified in this proposal will require a separate agreement.",
      `Validity: This proposal is valid for 30 days from the date issued${isExpired ? " (EXPIRED)" : ` (Valid until ${expirationDate})`}`,
      "Commencement of Ad Management: The initial ad management period (1 month) will begin once all essential assets—including CRM access, video creatives, and static visuals—have been delivered and approved. Ongoing management beyond this period will require enrollment in one of Falcore's subscription packages.",
      "Advertising Platforms: Falcore can manage advertising across any major platform. Platform selection is based on the client's budget and marketing strategy, with common starting points being Google Ads and Meta platforms.",
      "Ad Spend Handling: Ad budgets will be actively managed by Falcore. However, all payments for ad spend will be made directly by the client through their own advertising account(s).",
      "CRM Usage Terms: If a client chooses not to continue with a subscription plan after the initial engagement but wishes to retain CRM access, a fee of AED 300 per month will apply. This fee is included at no extra cost for clients on a subscription plan.",
      "Ownership of Data and Assets: All CRM data, leads, and creative assets produced for the client remain the exclusive property of the client. Upon request, a Non-Disclosure Agreement (NDA) may be signed. In the case of a full refund under our satisfaction guarantee, ownership of all deliverables reverts to Falcore and use of such content is no longer permitted.",
      "Optimization Commitment: Campaigns managed during the initial period will be actively optimized for performance, with the goal of delivering meaningful results and building a strong foundation for long-term collaboration.",
      "Delivery of Assets and Reports: All final assets and reports will be shared with the client upon completion and internal approval, ensuring transparency and full access.",
      "Support Response Time: Falcore provides customer support within 12–24 hours on business days, with most queries addressed much sooner.",
      "Reporting & Review Rights: Clients under ongoing management plans are entitled to request weekly performance reports or biweekly review meetings with their assigned account manager.",
      "Ad Account Access and Control: Advertising accounts will be created and owned by the client. Falcore will be granted access as an employee or partner for campaign management purposes only.",
      "Creative Revisions: All ad creatives will be uniquely tailored to the client's brand and may undergo revisions until satisfactory, within reasonable limits as defined in the package.",
      "Project Handover and Exit Support: If a client chooses not to continue with Falcore's services post-project, a full handover will be provided, along with two weeks of standby support to assist with the transition.",
    ];

    return (
      <View style={contractStyle.termsGrid}>
        {terms.map((term, index) => (
          <View
            key={index}
            style={[
              contractStyle.termItemCompact,
              { width: index === 5 ? "100%" : "50%" },
            ]}
          >
            <Text>
              <Text style={{ fontWeight: "bold" }}>{index + 1}. </Text>
              <Text>{term}</Text>
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Define company information for Falcore
  const agencyInfo = {
    name: "Amir Mahdi Banki",
    title: "CEO, XLUXIVE DIGITAL MARKETING LLC",
    email: "faez@falcoretech.com",
    phone: "+971 50 810 7712",
  };

  return (
    <Document>
      <Page size="A4" style={contractStyle.page} wrap>
        {/* Watermark */}
        <View style={contractStyle.watermark}>
          <Image src="/logo-transparent.webp" style={contractStyle.watermarkImage} />
        </View>

        {/* Header */}
        <View style={contractStyle.header}>
          <View style={contractStyle.headerContent}>
            <Image src="/logo-transparent.webp" style={contractStyle.logo} />
            <Text style={contractStyle.title}>Marketing Contract</Text>
            <Text style={contractStyle.subtitle}>
              Prepared exclusively for {isCustomProposal ? proposalData.clientInfo?.companyName : proposalData.companyName}
            </Text>
          </View>
        </View>

        {/* From and For Section */}
        <View style={{ marginBottom: 20, paddingHorizontal: 30 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 5 }}>From:</Text>
              <Text style={{ fontSize: 11, marginBottom: 2 }}>Falcore</Text>
              <Text style={{ fontSize: 10, color: "#666" }}>The Curve Building M44</Text>
              <Text style={{ fontSize: 10, color: "#666" }}>Dubai, UAE</Text>
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ fontSize: 12, fontWeight: "bold", marginBottom: 5 }}>For:</Text>
              <Text style={{ fontSize: 11, marginBottom: 2 }}>
                {isCustomProposal ? proposalData.clientInfo?.companyName : proposalData.companyName}
              </Text>
              <Text style={{ fontSize: 10, color: "#666" }}>
                {isCustomProposal ? proposalData.clientInfo?.clientName : proposalData.clientName}
              </Text>
            </View>
          </View>
        </View>

        {/* Client Information */}
        <View style={contractStyle.clientInfo}>
          <View style={contractStyle.clientInfoBlock}>
            <Text style={contractStyle.clientInfoLabel}>Client Name:</Text>
            <Text style={contractStyle.clientInfoValue}>
              {isCustomProposal ? proposalData.clientInfo?.clientName : proposalData.clientName}
            </Text>
          </View>

          <View style={contractStyle.clientInfoBlock}>
            <Text style={contractStyle.clientInfoLabel}>Company:</Text>
            <Text style={contractStyle.clientInfoValue}>
              {isCustomProposal ? proposalData.clientInfo?.companyName : proposalData.companyName}
            </Text>
          </View>

          <View style={contractStyle.clientInfoBlock}>
            <Text style={contractStyle.clientInfoLabel}>Proposal Date:</Text>
            <Text style={contractStyle.clientInfoValue}>{formattedDate}</Text>
          </View>
        </View>

        {/* Order ID */}
        {orderId && (
          <View style={contractStyle.contractId}>
            <Text style={contractStyle.contractIdText}>
              <Text style={{ fontWeight: "bold" }}>
                Order ID / Contract Reference:
              </Text>{" "}
              {orderId}
            </Text>
          </View>
        )}

        {/* Project Details (Additional Information) */}
        {proposalData.additionalInfo && (
          <View style={contractStyle.section}>
            <Text style={contractStyle.sectionTitle}>Project Details</Text>
            <View style={contractStyle.packageBox}>
              <Text style={{ fontSize: 9, lineHeight: 1.5 }}>
                {proposalData.additionalInfo}
              </Text>
            </View>
          </View>
        )}

        {/* Investment Summary FIRST (moved up to ensure quote is on first page) */}
        <View style={contractStyle.section}>
          <Text style={contractStyle.sectionTitle}>Investment Summary</Text>

          <View style={contractStyle.summaryTable}>
            {/* Custom Services for Custom Proposals */}
            {isCustomProposal && proposalData.services && proposalData.services.map((service) => (
              <View style={contractStyle.summaryRow} key={service.id}>
                <Text style={contractStyle.summaryCol1}>
                  {service.name}
                  {service.isMainService && " (Main Service)"}
                  {service.paymentType === "monthly" ? " - Monthly" : " - One-time"}
                </Text>
                <Text style={contractStyle.summaryCol2}>
                  {formatPrice(service.price)} AED
                  {service.paymentType === "monthly" && "/mo"}
                </Text>
              </View>
            ))}
            
            {/* Package row - for standard proposals */}
            {!isCustomProposal && proposalData.includePackage && proposalData.selectedPackage && (
              <View style={contractStyle.summaryRow}>
                <Text style={contractStyle.summaryCol1}>
                  {proposalData.selectedPackage.name} Package
                  {proposalData.discounts?.packageDiscount?.value > 0 &&
                    ` (${
                      proposalData.discounts.packageDiscount.type ===
                      "percentage"
                        ? proposalData.discounts.packageDiscount.value + "% OFF"
                        : "- " +
                          proposalData.discounts.packageDiscount.value +
                          " AED"
                    })`}
                </Text>
                <Text style={contractStyle.summaryCol2}>
                  {proposalData.discounts?.packageDiscount?.value > 0
                    ? proposalData.discounts.packageDiscount.type ===
                      "percentage"
                      ? formatPrice(
                          parseFloat(
                            proposalData.selectedPackage.price
                              .toString()
                              .replace(/,/g, ""),
                          ) *
                            (1 -
                              proposalData.discounts.packageDiscount.value /
                                100),
                        )
                      : formatPrice(
                          parseFloat(
                            proposalData.selectedPackage.price
                              .toString()
                              .replace(/,/g, ""),
                          ) - proposalData.discounts.packageDiscount.value,
                        )
                    : proposalData.selectedPackage.price}{" "}
                  AED
                </Text>
              </View>
            )}

            {/* Service rows - for standard proposals */}
            {!isCustomProposal && proposalData.selectedServices &&
              proposalData.selectedServices.map((service, idx) => {
                const serviceDiscount =
                  proposalData.discounts?.serviceDiscounts?.[service.id];
                const originalPrice = parseFloat(
                  service.price.toString().replace(/,/g, ""),
                );
                let finalPrice = originalPrice;

                if (serviceDiscount && serviceDiscount.value > 0) {
                  if (serviceDiscount.type === "percentage") {
                    finalPrice =
                      originalPrice * (1 - serviceDiscount.value / 100);
                  } else {
                    finalPrice = Math.max(
                      0,
                      originalPrice - serviceDiscount.value,
                    );
                  }
                }

                return (
                  <View style={contractStyle.summaryRow} key={idx}>
                    <Text style={contractStyle.summaryCol1}>
                      {service.name}
                      {serviceDiscount &&
                        serviceDiscount.value > 0 &&
                        ` (${
                          serviceDiscount.type === "percentage"
                            ? serviceDiscount.value + "% OFF"
                            : "- " + serviceDiscount.value + " AED"
                        })`}
                    </Text>
                    <Text style={contractStyle.summaryCol2}>
                      {formatPrice(finalPrice)} AED
                    </Text>
                  </View>
                );
              })}

            {/* Subtotal */}
            <View style={contractStyle.summaryRow}>
              <Text
                style={{ ...contractStyle.summaryCol1, fontWeight: "bold" }}
              >
                Subtotal
              </Text>
              <Text
                style={{ ...contractStyle.summaryCol2, fontWeight: "bold" }}
              >
                {formatPrice(subtotal)} AED
              </Text>
            </View>

            {/* Overall Discount */}
            {proposalData.discounts?.overallDiscount?.value > 0 && (
              <View style={contractStyle.summaryRow}>
                <Text style={contractStyle.summaryCol1}>
                  Overall Discount (
                  {proposalData.discounts.overallDiscount.type === "percentage"
                    ? proposalData.discounts.overallDiscount.value + "%"
                    : formatPrice(
                        proposalData.discounts.overallDiscount.value,
                      ) + " AED"}
                  )
                </Text>
                <Text
                  style={{ ...contractStyle.summaryCol2, color: "#10B981" }}
                >
                  -{formatPrice(discountAmount)} AED
                </Text>
              </View>
            )}

            {/* Tax */}
            {proposalData.includeTax !== false && (
              <View style={contractStyle.summaryRow}>
                <Text style={contractStyle.summaryCol1}>VAT (5%)</Text>
                <Text style={contractStyle.summaryCol2}>
                  {formatPrice(taxAmount)} AED
                </Text>
              </View>
            )}

            {/* Total */}
            <View style={contractStyle.summaryTotal}>
              <Text style={contractStyle.summaryTotalLabel}>
                Total Investment{" "}
                {proposalData.includeTax !== false ? "(Inc. VAT)" : ""}
              </Text>
              <Text style={contractStyle.summaryTotalValue}>
                {formatPrice(totalAmount)} AED
              </Text>
            </View>

            {/* Monthly Fee */}
            {hasMonthlyFees() && (
              <Text style={contractStyle.monthlyNote}>
                Plus {formatPrice(monthlyFees)} AED monthly fee(s)
              </Text>
            )}
          </View>
        </View>

        {/* Package */}
        {proposalData.includePackage && proposalData.selectedPackage && (
          <View style={contractStyle.section}>
            <Text style={contractStyle.sectionTitle}>Selected Package</Text>
            <View style={contractStyle.packageBox}>
              <Text style={contractStyle.packageName}>
                {proposalData.selectedPackage.name} Package
              </Text>
              <Text style={contractStyle.packageDescription}>
                {proposalData.selectedPackage.description}
              </Text>

              <Text style={contractStyle.packagePrice}>
                Price: {proposalData.selectedPackage.price}{" "}
                {proposalData.selectedPackage.currency}
              </Text>

              {proposalData.selectedPackage.features &&
                proposalData.selectedPackage.features.length > 0 && (
                  <View style={contractStyle.featuresList}>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "bold",
                        marginBottom: 3,
                      }}
                    >
                      Features:
                    </Text>
                    {getFormattedFeatures(
                      proposalData.selectedPackage.features,
                    )}
                  </View>
                )}
            </View>
          </View>
        )}

        {/* Services - Custom Proposals */}
        {isCustomProposal && proposalData.services && proposalData.services.length > 0 && (
          <View style={contractStyle.section}>
            <Text style={contractStyle.sectionTitle}>Services</Text>
            {proposalData.services.map((service, index) => (
              <View style={contractStyle.packageBox} key={service.id}>
                <Text style={contractStyle.packageName}>
                  {service.name}
                  {service.isMainService && " - Main Service"}
                </Text>
                {service.description && (
                  <Text style={contractStyle.packageDescription}>
                    {service.description}
                  </Text>
                )}
                <Text style={contractStyle.packagePrice}>
                  Price: {formatPrice(service.price)} AED
                  {service.paymentType === "monthly" ? " per month" : " (one-time)"}
                </Text>
                {service.features && service.features.length > 0 && (
                  <View style={contractStyle.featuresList}>
                    <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 3 }}>
                      Features:
                    </Text>
                    {service.features.map((feature, idx) => (
                      <View style={contractStyle.featureItem} key={idx}>
                        <Text style={contractStyle.featureBullet}>•</Text>
                        <Text style={contractStyle.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Services - Standard Proposals */}
        {!isCustomProposal && proposalData.selectedServices &&
          proposalData.selectedServices.length > 0 && (
            <View style={contractStyle.section}>
              <Text style={contractStyle.sectionTitle}>
                Additional Services
              </Text>
              <View
                style={{
                  flexDirection:
                    proposalData.selectedServices.length > 2 ? "row" : "column",
                  flexWrap: "wrap",
                }}
              >
                {proposalData.selectedServices.map((service, index) => (
                  <View
                    style={[
                      contractStyle.serviceBox,
                      proposalData.selectedServices.length > 2
                        ? {
                            width: "48%",
                            marginRight: index % 2 === 0 ? "4%" : 0,
                          }
                        : { width: "100%" },
                    ]}
                    key={index}
                  >
                    <Text style={contractStyle.serviceName}>
                      {service.name}
                    </Text>
                    <Text style={contractStyle.serviceDescription}>
                      {service.description && service.description.length > 100
                        ? service.description.substring(0, 100) + "..."
                        : service.description}
                    </Text>
                    <Text style={contractStyle.servicePrice}>
                      Price: {service.price} {service.currency || "AED"}
                      {(service.monthly || service.is_monthly) &&
                        (service.setupFee || service.setup_fee) &&
                        ` + ${service.setupFee || service.setup_fee} AED/month`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Terms & Conditions */}
        <View style={contractStyle.terms}>
          <Text style={contractStyle.termsTitle}>Terms and Conditions</Text>
          {/* Check for new TOS system first */}
          {proposalData.tos_snapshot && Array.isArray(proposalData.tos_snapshot) ? (
            <View style={{ paddingTop: 5 }}>
              {proposalData.tos_snapshot.map((term, index) => (
                <View key={index} style={{ flexDirection: "row", marginBottom: 5, alignItems: "flex-start" }}>
                  <Text style={{ fontSize: 9, fontWeight: "bold", marginRight: 5, color: "#DC2626" }}>
                    {index + 1}.
                  </Text>
                  <Text style={{ fontSize: 9, lineHeight: 1.4, flex: 1 }}>
                    <Text style={{ fontWeight: "bold" }}>{term.title}: </Text>
                    {term.content}
                  </Text>
                </View>
              ))}
            </View>
          ) : isCustomProposal && proposalData.terms === "custom" && proposalData.customTerms && proposalData.customTerms.length > 0 ? (
            <View style={{ paddingTop: 5 }}>
              {proposalData.customTerms.map((term, index) => (
                <View key={index} style={{ flexDirection: "row", marginBottom: 5, alignItems: "flex-start" }}>
                  <Text style={{ fontSize: 9, fontWeight: "bold", marginRight: 5, color: "#DC2626" }}>
                    {index + 1}.
                  </Text>
                  <Text style={{ fontSize: 9, lineHeight: 1.4, flex: 1 }}>
                    {term}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            renderTermsCompact()
          )}
        </View>

        {/* Bank Information Section - Added before signatures */}
        <View style={contractStyle.bankInfoContainer}>
          <Text style={contractStyle.bankInfoTitle}>Payment Information</Text>
          <View style={contractStyle.bankInfoGrid}>
            <View style={contractStyle.bankInfoItem}>
              <Text style={contractStyle.bankInfoLabel}>Account Holder:</Text>
              <Text style={contractStyle.bankInfoValue}>
                XLUXIVE DIGITAL MARKETING L.L.C
              </Text>
            </View>
            <View style={contractStyle.bankInfoItem}>
              <Text style={contractStyle.bankInfoLabel}>IBAN:</Text>
              <Text style={contractStyle.bankInfoValue}>
                AE590860000009339072484
              </Text>
            </View>
            <View style={contractStyle.bankInfoItem}>
              <Text style={contractStyle.bankInfoLabel}>BIC/SWIFT:</Text>
              <Text style={contractStyle.bankInfoValue}>WIOBAEADXXX</Text>
            </View>
            <View style={contractStyle.bankInfoItem}>
              <Text style={contractStyle.bankInfoLabel}>Business Address:</Text>
              <Text style={contractStyle.bankInfoValue}>
                The Curve Building M44, Dubai, UAE
              </Text>
            </View>
          </View>
          <Text style={contractStyle.bankInfoNote}>
            Please reference your Order ID ({orderId || "as provided"}) when
            making payment
          </Text>
        </View>

        {/* Accepted or Signatures */}
        {isAcceptedOrPaid ? (
          <View>
            <Text style={contractStyle.acceptedBadge}>
              This proposal has been {status?.toLowerCase()} and all terms are
              finalized.
            </Text>

            {/* Add stamp here too for accepted proposals */}
            <View
              style={[
                contractStyle.stamp,
                { position: "relative", alignSelf: "center", marginTop: 20 },
              ]}
            >
              <Image
                src="/falcore-company-stamp.png"
                style={{ width: 120, height: 120 }}
              />
            </View>
          </View>
        ) : (
          <View style={contractStyle.signatures}>
            <View style={contractStyle.signatureBlock}>
              <Text style={contractStyle.signatureTitle}>For Falcore:</Text>
              <View style={contractStyle.signatureLine} />
              <Text style={contractStyle.signedBy}>{agencyInfo.name}</Text>
              <Text style={contractStyle.signatureLabel}>{agencyInfo.title}</Text>
              <Text style={contractStyle.signatureDate}>{currentDate}</Text>

              {/* Company stamp */}
              <View style={contractStyle.stamp}>
                <Image
                  src="/falcore-company-stamp.png"
                  style={{ width: 120, height: 120 }}
                />
              </View>
            </View>

            <View style={contractStyle.signatureBlock}>
              <Text style={contractStyle.signatureTitle}>
                For {isCustomProposal ? proposalData.clientInfo?.companyName : proposalData.companyName}:
              </Text>
              <View style={contractStyle.signatureLine} />
              <Text style={contractStyle.signatureLabel}>
                Name: _______________________
              </Text>
              <Text style={contractStyle.signatureLabel}>
                Position: ___________________
              </Text>
              <Text style={contractStyle.signatureLabel}>
                Date: _______________________
              </Text>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={contractStyle.footer}>
          <Text style={contractStyle.contactInfo}>Contact Information:</Text>
          <Text style={contractStyle.contactInfo}>
            Email: {agencyInfo.email} | Phone: {agencyInfo.phone} | Website: falcoretech.com
          </Text>

          <Text style={contractStyle.printDate}>
            Printed on: {new Date().toLocaleString()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ProposalPDF;
