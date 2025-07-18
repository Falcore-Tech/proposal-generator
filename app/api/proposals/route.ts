import { createClient } from "@/utils/supabase/server";
import { randomUUID } from "crypto";
import {
  generateOrderId,
  getNextSequentialNumber,
} from "@/lib/orderIdGenerator";
import { requireAuth } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    if (!user || !user.id) {
      console.error("User or user.id is null:", { user });
      return Response.json(
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
      return Response.json(
        { error: "User profile not found. Please contact an administrator." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { proposalData, encodedData } = body;

    if (!proposalData || !encodedData) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Handle ToS template selection
    let tosTemplateId = null;
    let tosSnapshot = null;
    
    if (proposalData.selectedToS && proposalData.selectedToS !== "custom") {
      // Selected a ToS template
      tosTemplateId = proposalData.selectedToS;
      
      // Fetch the template to store a snapshot
      const { data: tosTemplate } = await supabase
        .from("tos_templates")
        .select("*")
        .eq("id", proposalData.selectedToS)
        .single();
        
      if (tosTemplate) {
        tosSnapshot = tosTemplate.terms;
      }
    } else if (proposalData.selectedToS === "custom" && proposalData.customTerms && proposalData.customTerms.length > 0) {
      // Custom terms - convert to ToSTerm format
      tosSnapshot = proposalData.customTerms.map((term, index) => ({
        id: index + 1,
        title: "",
        content: term,
        order: index + 1
      }));
    }

    // First get or create the client
    const { data: existingClient } = await supabase
      .from("clients")
      .select()
      .eq("company_name", proposalData.companyName)
      .maybeSingle();

    let clientId;

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      // Create new client
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          name: proposalData.clientName,
          company_name: proposalData.companyName,
          email: proposalData.email || null,
        })
        .select()
        .single();

      if (clientError) {
        throw clientError;
      }

      clientId = newClient.id;
    }

    // Generate a unique order ID
    const nextSequence = await getNextSequentialNumber(supabase);
    const orderId = generateOrderId(nextSequence);
    console.log(orderId)

    // Save the proposal with the order ID
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .insert({
        client_id: clientId,
        title: `Proposal for ${proposalData.companyName}`,
        client_name: proposalData.clientName,
        company_name: proposalData.companyName,
        proposal_date: proposalData.proposalDate,
        additional_info: proposalData.additionalInfo || null,
        include_package: proposalData.includePackage || false,
        package_id: proposalData.includePackage ? proposalData.selectedPackageId : null,
        package_discount_type: proposalData.packageDiscountType || "percentage",
        package_discount_value: proposalData.packageDiscountValue || 0,
        overall_discount_type: proposalData.overallDiscountType || "percentage",
        overall_discount_value: proposalData.overallDiscountValue || 0,
        include_tax: proposalData.includeTax || false,
        validity_days: proposalData.validityDays || 30,
        proposal_data: proposalData,
        encoded_data: encodedData,
        status: "draft",
        order_id: orderId,
        created_by: user.id,
        tos_template_id: tosTemplateId,
        tos_snapshot: tosSnapshot,
      })
      .select()
      .single();

    if (proposalError) {
      throw proposalError;
    }

    // Create a link token
    const token = randomUUID();

    const { data: link, error: linkError } = await supabase
      .from("proposal_links")
      .insert({
        proposal_id: proposal.id,
        token,
        views_count: 0,
      })
      .select()
      .single();

    if (linkError) {
      throw linkError;
    }

    const baseUrl =
      request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "";

    return Response.json({
      proposal: {
        ...proposal,
        link: `${baseUrl}/proposal?token=${token}`,
      },
    });
  } catch (error) {
    console.error("Error saving proposal:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth();
    if (authError) return authError;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("includeArchived") === "true";
    const archivedOnly = searchParams.get("archivedOnly") === "true";
    const createdBy = searchParams.get("createdBy");
    
    // Get user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();


    let query = supabase
      .from("proposals")
      .select(
        `
        *,
        client:clients(*),
        links:proposal_links(*),
        created_by_profile:profiles!created_by(name, email)
      `,
      );

    // Role-based filtering
    if (profile?.role === "sales_rep") {
      // Sales reps can only see their own proposals
      query = query.eq("created_by", user.id);
    } else if (createdBy) {
      // Admin filtering by specific creator
      query = query.eq("created_by", createdBy);
    }
    // Admins can see all proposals (no additional filter needed)

    // Archive filtering
    if (archivedOnly) {
      query = query.not("archived_at", "is", null);
    } else if (!includeArchived) {
      query = query.is("archived_at", null);
    }
    // If includeArchived is true, we don't add any archive filter

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      throw error;
    }


    return Response.json({ proposals: data });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
