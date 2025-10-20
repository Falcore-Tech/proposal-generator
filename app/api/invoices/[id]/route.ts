import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await createClient();

    const resolvedParams = await params;
    
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*, proposals(company_name, client_name, proposal_data)")
      .eq("id", resolvedParams.id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    const { user, error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await createClient();
    const body = await request.json();
    const resolvedParams = await params;

    // If updating payment information
    if (body.status === 'paid' && body.payment_date) {
      const { error } = await supabase
        .from("invoices")
        .update({
          status: body.status,
          payment_date: body.payment_date,
          payment_method: body.payment_method,
          payment_reference: body.payment_reference,
          updated_at: new Date().toISOString()
        })
        .eq("id", resolvedParams.id);

      if (error) {
        console.error("Error updating invoice payment:", error);
        return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // General invoice update
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (body.status !== undefined) updateData.status = body.status;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;
    if (body.dueDate !== undefined) updateData.due_date = body.dueDate; // Support both formats
    if (body.client_trn !== undefined) updateData.client_trn = body.client_trn;
    if (body.clientTrn !== undefined) updateData.client_trn = body.clientTrn; // Support both formats
    if (body.client_address !== undefined) updateData.client_address = body.client_address;
    if (body.clientAddress !== undefined) updateData.client_address = body.clientAddress; // Support both formats
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.discount_type !== undefined) updateData.discount_type = body.discount_type;
    if (body.discount_value !== undefined) updateData.discount_value = body.discount_value;
    if (body.discount_amount !== undefined) updateData.discount_amount = body.discount_amount;
    if (body.apply_vat !== undefined) updateData.apply_vat = body.apply_vat;
    
    // Handle subtotal, vat_amount, and total_amount if provided directly
    if (body.subtotal !== undefined) updateData.subtotal = body.subtotal;
    if (body.vat_amount !== undefined) updateData.vat_amount = body.vat_amount;
    if (body.total_amount !== undefined) updateData.total_amount = body.total_amount;
    
    if (body.line_items !== undefined || body.lineItems !== undefined) {
      const lineItems = body.line_items || body.lineItems;
      updateData.line_items = lineItems;
      
      // Only recalculate if totals weren't provided directly
      if (body.subtotal === undefined || body.vat_amount === undefined || body.total_amount === undefined) {
        const subtotal = lineItems.reduce((sum: number, item: any) => {
          const total = item.total || item.lineTotal || (item.quantity * item.unit_price) || 0;
          return sum + total;
        }, 0);
        
        // Calculate discount amount
        const discountType = body.discount_type || updateData.discount_type;
        const discountValue = body.discount_value || updateData.discount_value || 0;
        let discountAmount = 0;
        if (discountType && discountValue > 0) {
          if (discountType === 'percentage') {
            discountAmount = subtotal * (discountValue / 100);
          } else {
            discountAmount = discountValue;
          }
        }

        const discountedSubtotal = subtotal - discountAmount;
        const applyVat = body.apply_vat ?? updateData.apply_vat ?? true;
        const vatAmount = applyVat ? discountedSubtotal * 0.05 : 0;
        const totalAmount = discountedSubtotal + vatAmount;
        
        updateData.subtotal = subtotal;
        updateData.discount_amount = discountAmount;
        updateData.vat_amount = vatAmount;
        updateData.total_amount = totalAmount;
      }
    }
    
    // Update invoice
    const { data: invoice, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", resolvedParams.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating invoice:", error);
      return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await createClient();
    const resolvedParams = await params;

    // Hard delete the invoice from the database
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", resolvedParams.id);

    if (error) {
      console.error("Error deleting invoice:", error);
      return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}