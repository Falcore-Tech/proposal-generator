import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateOrderId, getNextSequentialNumber } from "@/lib/orderIdGenerator";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    if (!user || !user.id) {
      console.error("User or user.id is null:", { user });
      return NextResponse.json(
        { error: "Invalid user session" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Verify user has a valid profile record
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found. Please contact an administrator." },
        { status: 400 }
      );
    }

    const proposalData = await request.json();
    const { clientInfo, services, discount, discountType, taxIncluded, terms, customTerms } = proposalData;
    
    // Handle ToS template selection
    let tosTemplateId = null;
    let tosSnapshot = null;
    
    if (terms && terms !== "custom") {
      // Selected a ToS template
      tosTemplateId = terms;
      
      // Fetch the template to store a snapshot
      const { data: tosTemplate } = await supabase
        .from("tos_templates")
        .select("*")
        .eq("id", terms)
        .single();
        
      if (tosTemplate) {
        tosSnapshot = tosTemplate.terms;
      }
    } else if (terms === "custom" && customTerms && customTerms.length > 0) {
      // Custom terms - convert to ToSTerm format
      tosSnapshot = customTerms.map((term, index) => ({
        id: index + 1,
        title: "",
        content: term,
        order: index + 1
      }));
    }

    // Create or find client
    let clientId: string;
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("company_name", clientInfo.companyName)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: clientInfo.clientName,
          company_name: clientInfo.companyName,
        })
        .select("id")
        .single();

      if (clientError || !newClient) {
        console.error("Client creation error:", clientError);
        throw new Error(`Failed to create client: ${clientError?.message || "Unknown error"}`);
      }
      clientId = newClient.id;
    }

    // Generate order ID
    const nextSequence = await getNextSequentialNumber(supabase);
    console.log("Next sequence:", nextSequence, typeof nextSequence);
    const orderId = generateOrderId(nextSequence);
    console.log("Generated order ID:", orderId);

    // Calculate totals
    const subtotal = services.reduce((sum: number, service: any) => sum + service.price, 0);
    const discountAmount = discountType === "percentage" 
      ? (subtotal * discount) / 100 
      : discount;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = taxIncluded ? afterDiscount * 0.05 : 0;
    const totalAmount = afterDiscount + taxAmount;

    // Prepare proposal data
    const proposalPayload = {
      order_id: orderId,
      client_id: clientId,
      client_name: clientInfo.clientName,
      company_name: clientInfo.companyName,
      status: "pending",
      proposal_date: clientInfo.proposalDate,
      created_by: user.id,
      tos_template_id: tosTemplateId,
      tos_snapshot: tosSnapshot,
      proposal_data: {
        clientInfo,
        services,
        discount,
        discountType,
        taxIncluded,
        terms,
        customTerms,
        isCustomProposal: true,
        calculations: {
          subtotal,
          discountAmount,
          taxAmount,
          totalAmount,
        },
      },
    };

    // Create proposal
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .insert(proposalPayload)
      .select("id")
      .single();

    if (proposalError || !proposal) {
      console.error("Proposal creation error:", proposalError);
      throw new Error(`Failed to create proposal: ${proposalError?.message || "Unknown error"}`);
    }

    // Generate shareable link
    const token = crypto.randomUUID();
    const { error: linkError } = await supabase
      .from("proposal_links")
      .insert({
        proposal_id: proposal.id,
        token,
      });

    if (linkError) {
      console.error("Proposal link creation error:", linkError);
      throw new Error(`Failed to create proposal link: ${linkError?.message || "Unknown error"}`);
    }

    const proposalUrl = `/proposal?token=${token}`;

    return NextResponse.json({ proposalUrl });
  } catch (error) {
    console.error("Error creating custom proposal:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 }
    );
  }
}