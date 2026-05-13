import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";
import type { CreateInvoiceRequest, InvoiceLineItem } from "@/types/invoice";
import { requireAdmin } from "@/lib/auth/api";
import { getPostHogClient } from "@/lib/posthog-server";

// Default company information
const COMPANY_INFO = {
  name: "XLUXIVE DIGITAL MARKETING LLC",
  address: "Office: M-44, THE CURVE BUILDING-AL Qouz, Al Qouz Third, Dubai, United Arab Emirates",
  phone: "+971 50 810 7712",
  trn: "104853792000003",
  bankAccountHolder: "XLUXIVE DIGITAL MARKETING LLC",
  iban: "AE590860000009339072484",
  swiftCode: "WIOBAEADXXX",
  bankAddress: "Office: M-44, THE CURVE BUILDING-AL QOUZ, Al Qouz Third, Dubai, United Arab Emirates"
};

export async function POST(request: Request) {
  try {
    // Require admin authentication
    const { user, error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await createClient();
    const body = await request.json();
    
    // Check if this is a proposal-based invoice or standalone
    if (body.proposalId) {
      // Original proposal-based invoice creation
      const { proposalId, dueDate, lineItems, clientTrn, clientAddress, discountType, discountValue, applyVat } = body;

      // Fetch proposal data
      const { data: proposal, error: proposalError } = await supabase
        .from("proposals")
        .select("*")
        .eq("id", proposalId)
        .single();

      if (proposalError || !proposal) {
        return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
      }

      // Calculate totals
      const subtotal = lineItems.reduce((sum: number, item: InvoiceLineItem) => sum + item.lineTotal, 0);
      
      // Calculate discount amount
      let discountAmount = 0;
      if (discountValue && discountValue > 0) {
        if (discountType === 'percentage') {
          discountAmount = subtotal * (discountValue / 100);
        } else {
          discountAmount = discountValue;
        }
      }
      
      const discountedSubtotal = subtotal - discountAmount;
      const vatAmount = applyVat !== false ? discountedSubtotal * 0.05 : 0; // 5% VAT
      const totalAmount = discountedSubtotal + vatAmount;

      // Generate invoice number
      const { data: invoiceNumber } = await supabase.rpc("generate_monthly_invoice_number");

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          proposal_id: proposalId,
          order_id: proposal.order_id || "",
          issuer_name: COMPANY_INFO.name,
          issuer_address: COMPANY_INFO.address,
          issuer_phone: COMPANY_INFO.phone,
          issuer_trn: COMPANY_INFO.trn,
          client_name: proposal.client_name,
          client_company: proposal.company_name,
          client_address: clientAddress || COMPANY_INFO.address, // Default if not provided
          client_trn: clientTrn,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: dueDate,
          currency: "AED",
          line_items: lineItems,
          bank_account_holder: COMPANY_INFO.bankAccountHolder,
          iban: COMPANY_INFO.iban,
          swift_code: COMPANY_INFO.swiftCode,
          bank_address: COMPANY_INFO.bankAddress,
          subtotal,
          discount_type: discountType,
          discount_value: discountValue,
          discount_amount: discountAmount,
          apply_vat: applyVat ?? true,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          status: "draft",
          created_by: user!.id
        })
        .select()
        .single();

      if (invoiceError) {
        console.error("Invoice creation error:", invoiceError);
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
      }

      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: user!.id,
        event: "invoice_created",
        properties: {
          invoice_id: invoice!.id,
          invoice_number: invoice!.invoice_number,
          proposal_id: proposalId,
          total_amount: totalAmount,
          currency: "AED",
          is_standalone: false,
        },
      });

      return NextResponse.json({ invoice });
    } else {
      // Standalone invoice creation
      const {
        client_name,
        client_company,
        client_address,
        client_trn,
        issue_date,
        due_date,
        line_items,
        subtotal,
        vat_amount,
        total_amount,
        notes,
        is_recurring,
        recurring_interval,
        recurring_start_date,
        discount_type,
        discount_value,
        discount_amount,
        apply_vat
      } = body;

      // Generate invoice number
      const { data: invoiceNumber } = await supabase.rpc("generate_monthly_invoice_number");

      // Generate a standalone order ID
      const orderDate = new Date();
      const year = orderDate.getFullYear();
      const month = String(orderDate.getMonth() + 1).padStart(2, '0');
      const timestamp = Date.now().toString().slice(-5);
      const orderId = `XMA-${year}-${month}-${timestamp}`;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          order_id: orderId,
          issuer_name: COMPANY_INFO.name,
          issuer_address: COMPANY_INFO.address,
          issuer_phone: COMPANY_INFO.phone,
          issuer_trn: COMPANY_INFO.trn,
          client_name,
          client_company,
          client_address,
          client_trn,
          issue_date,
          due_date,
          currency: "AED",
          line_items,
          bank_account_holder: COMPANY_INFO.bankAccountHolder,
          iban: COMPANY_INFO.iban,
          swift_code: COMPANY_INFO.swiftCode,
          bank_address: COMPANY_INFO.bankAddress,
          subtotal,
          discount_type: discount_type || null,
          discount_value: discount_value || 0,
          discount_amount: discount_amount || 0,
          apply_vat: apply_vat ?? true,
          vat_amount,
          total_amount,
          status: "draft",
          notes,
          is_recurring,
          recurring_interval,
          recurring_start_date,
          created_by: user!.id
        })
        .select()
        .single();

      if (invoiceError) {
        console.error("Invoice creation error:", invoiceError);
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
      }

      // If it's a recurring invoice, create a recurring template
      if (is_recurring) {
        await supabase
          .from("recurring_invoice_templates")
          .insert({
            name: `Recurring invoice for ${client_company}`,
            client_name,
            client_company,
            client_address,
            client_trn,
            line_items,
            recurring_interval,
            next_invoice_date: calculateNextInvoiceDate(recurring_start_date, recurring_interval),
            is_active: true,
            created_by: user!.id
          });
      }

      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: user!.id,
        event: "invoice_created",
        properties: {
          invoice_id: invoice!.id,
          invoice_number: invoice!.invoice_number,
          total_amount,
          currency: "AED",
          is_standalone: true,
          is_recurring: !!is_recurring,
          client_company,
        },
      });

      return NextResponse.json({ invoice });
    }
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function calculateNextInvoiceDate(startDate: string, interval: string): string {
  const date = new Date(startDate);
  
  switch (interval) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date.toISOString().split('T')[0];
}

export async function GET(request: Request) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposalId");

    let query = supabase
      .from("invoices")
      .select("*, proposals(company_name, client_name)")
      .order("created_at", { ascending: false });

    if (proposalId) {
      query = query.eq("proposal_id", proposalId);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error("Error fetching invoices:", error);
      return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
    }

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
