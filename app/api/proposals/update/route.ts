import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/auth/api";

export async function PUT(request: NextRequest) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const body = await request.json();
    const { proposalId, formData } = body;

    if (!proposalId || !formData) {
      return NextResponse.json(
        { error: "Missing proposalId or formData" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch the selected package to include in proposal_data
    let selectedPackage = null;
    if (formData.includePackage && formData.selectedPackageId) {
      const { data: packageData, error: packageError } = await supabase
        .from("packages")
        .select("*, features:package_features(*)")
        .eq("id", formData.selectedPackageId)
        .single();

      if (packageError) {
        console.error("Error fetching package:", packageError);
        return NextResponse.json(
          { error: "Failed to fetch package data" },
          { status: 500 }
        );
      }

      selectedPackage = packageData;
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (formData.validityDays || 30));

    // Create enhanced proposal data with full package object
    const enhancedProposalData = {
      ...formData,
      selectedPackage: selectedPackage
    };

    const updateData = {
      client_name: formData.clientName,
      company_name: formData.companyName,
      proposal_date: formData.proposalDate,
      additional_info: formData.additionalInfo,
      include_package: formData.includePackage,
      package_id: formData.includePackage ? formData.selectedPackageId : null,
      package_discount_type: formData.discounts.packageDiscount.type,
      package_discount_value: formData.discounts.packageDiscount.value,
      overall_discount_type: formData.discounts.overallDiscount.type,
      overall_discount_value: formData.discounts.overallDiscount.value,
      proposal_data: enhancedProposalData,
      validity_days: formData.validityDays,
      expires_at: expiresAt.toISOString(),
      include_tax: formData.includeTax,
      updated_at: new Date().toISOString()
    };


    // Update the existing proposal
    const { error: proposalError } = await supabase
      .from("proposals")
      .update(updateData)
      .eq("id", proposalId);

    if (proposalError) {
      console.error("Database update error:", proposalError);
      return NextResponse.json(
        { error: proposalError.message },
        { status: 500 }
      );
    }

    // Get the proposal to find the associated client
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("client_id, clients(*)")
      .eq("id", proposalId)
      .single();

    if (fetchError) {
      console.error("Error fetching proposal:", fetchError);
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    // Update the associated client record if it exists
    if (proposal?.client_id) {
      const { error: clientError } = await supabase
        .from("clients")
        .update({
          name: formData.clientName,
          company_name: formData.companyName
        })
        .eq("id", proposal.client_id);

      if (clientError) {
        console.error("Client update error:", clientError);
        // Don't fail the request, just log the error
      }
    }

    // Update proposal services
    // Always delete existing services first
    await supabase
      .from("proposal_services")
      .delete()
      .eq("proposal_id", proposalId);

    // Insert new services if any are selected
    if (formData.selectedServices.length > 0) {
      const serviceEntries = formData.selectedServices.map((service: any) => {
        const discount = formData.discounts.serviceDiscounts[service.id] || {
          type: "percentage",
          value: 0,
        };

        return {
          proposal_id: proposalId,
          service_id: service.id,
          discount_type: discount.type,
          discount_value: discount.value,
        };
      });

      const { error: servicesError } = await supabase
        .from("proposal_services")
        .insert(serviceEntries);

      if (servicesError) {
        console.error("Services update error:", servicesError);
        return NextResponse.json(
          { error: servicesError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}