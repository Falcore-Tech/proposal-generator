import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/api";

export async function GET(request: Request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await createClient();

    // Get unique clients from existing invoices and proposals
    const { data: invoiceClients, error: invoiceError } = await supabase
      .from("invoices")
      .select("client_name, client_company, client_address, client_trn")
      .not("client_name", "is", null);

    const { data: proposalClients, error: proposalError } = await supabase
      .from("proposals")
      .select("client_name, company_name")
      .not("client_name", "is", null);

    if (invoiceError && proposalError) {
      console.error("Error fetching clients:", { invoiceError, proposalError });
      return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
    }

    // Combine and deduplicate clients
    const clientMap = new Map();

    // Add clients from invoices (with address and TRN)
    if (invoiceClients) {
      invoiceClients.forEach((client) => {
        const key = `${client.client_name}_${client.client_company}`;
        if (!clientMap.has(key)) {
          clientMap.set(key, {
            id: key,
            client_name: client.client_name,
            client_company: client.client_company,
            client_address: client.client_address || "",
            client_trn: client.client_trn || "",
            source: "invoice"
          });
        }
      });
    }

    // Add clients from proposals (without address and TRN)
    if (proposalClients) {
      proposalClients.forEach((client) => {
        const key = `${client.client_name}_${client.company_name}`;
        if (!clientMap.has(key)) {
          clientMap.set(key, {
            id: key,
            client_name: client.client_name,
            client_company: client.company_name,
            client_address: "",
            client_trn: "",
            source: "proposal"
          });
        }
      });
    }

    const clients = Array.from(clientMap.values());
    
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await createClient();
    const body = await request.json();

    const { client_name, client_company, client_address, client_trn } = body;

    if (!client_name || !client_company) {
      return NextResponse.json({ error: "Client name and company are required" }, { status: 400 });
    }

    // For now, we'll just return the client data
    // In a full implementation, you might want to store this in a dedicated clients table
    const client = {
      id: `${client_name}_${client_company}`,
      client_name,
      client_company,
      client_address: client_address || "",
      client_trn: client_trn || "",
      source: "manual"
    };

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}