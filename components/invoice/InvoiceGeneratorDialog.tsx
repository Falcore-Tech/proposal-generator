"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Trash2 } from "lucide-react";
import { format, addDays } from "date-fns";
import type { InvoiceLineItem, CreateInvoiceRequest } from "@/types/invoice";
import type { Database } from "@/types/supabase";

type Proposal = Database["public"]["Tables"]["proposals"]["Row"];

interface InvoiceGeneratorDialogProps {
  proposal: Proposal & {
    proposal_data?: any;
  };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const InvoiceGeneratorDialog: React.FC<InvoiceGeneratorDialogProps> = ({
  proposal,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  
  // Prefill client details from proposal data if available
  const proposalData = proposal.proposal_data || proposal;
  const [clientTrn, setClientTrn] = useState(proposalData.clientTrn || "");
  const [clientAddress, setClientAddress] = useState(proposalData.clientAddress || "");
  const [dueDate, setDueDate] = useState(
    format(addDays(new Date(), 30), "yyyy-MM-dd"),
  );
  
  // Discount state - prefill from proposal data if available
  const overallDiscount = proposalData.discounts?.overallDiscount;
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(
    overallDiscount?.type || 'percentage'
  );
  const [discountValue, setDiscountValue] = useState(
    overallDiscount?.value || 0
  );
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(() => {
    const items: InvoiceLineItem[] = [];
    
    // Use proposal_data if available for more complete information
    const data = proposal.proposal_data || proposal;

    // Add package if exists and is included
    if (data.includePackage && (data.selectedPackage || proposal.package)) {
      const pkg = data.selectedPackage || proposal.package;
      const quantity = 1;
      let unitPrice = pkg.price;

      // Apply package discount if exists
      const packageDiscountValue = data.discounts?.packageDiscount?.value || proposal.package_discount_value;
      const packageDiscountType = data.discounts?.packageDiscount?.type || proposal.package_discount_type;
      
      if (packageDiscountValue && packageDiscountValue > 0) {
        if (packageDiscountType === "percentage") {
          unitPrice = unitPrice * (1 - packageDiscountValue / 100);
        } else {
          unitPrice = unitPrice - packageDiscountValue;
        }
      }

      items.push({
        description: `${pkg.name}${pkg.description ? ` - ${pkg.description}` : ""}`,
        quantity,
        unitPrice: unitPrice,
        taxRate: 5,
        lineTotal: unitPrice * quantity,
      });
    }

    // Add services if exist
    const services = data.services || [];
    if (services.length > 0) {
      services.forEach((service: any) => {
        const quantity = 1;
        let unitPrice = service.price;

        // Apply service discount if exists
        const serviceDiscount = data.discounts?.serviceDiscounts?.[service.id];
        if (serviceDiscount?.value && serviceDiscount.value > 0) {
          if (serviceDiscount.type === "percentage") {
            unitPrice = unitPrice * (1 - serviceDiscount.value / 100);
          } else {
            unitPrice = unitPrice - serviceDiscount.value;
          }
        }

        items.push({
          description: `${service.name}${service.is_monthly ? " (Monthly)" : ""}`,
          quantity,
          unitPrice: unitPrice,
          taxRate: 5,
          lineTotal: unitPrice * quantity,
        });

        // Add setup fee if exists
        if (service.setup_fee && service.setup_fee > 0) {
          items.push({
            description: `${service.name} - Setup Fee`,
            quantity: 1,
            unitPrice: service.setup_fee,
            taxRate: 5,
            lineTotal: service.setup_fee,
          });
        }
      });
    }
    
    // Note: Overall discount is now handled separately, not as a line item

    // If no items found, add empty row
    return items.length > 0
      ? items
      : [
          {
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxRate: 5,
            lineTotal: 0,
          },
        ];
  });

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 5,
        lineTotal: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: keyof InvoiceLineItem,
    value: string | number,
  ) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: field === "description" ? value : Number(value),
    };

    // Recalculate line total
    if (field === "quantity" || field === "unitPrice") {
      updated[index].lineTotal =
        updated[index].quantity * updated[index].unitPrice;
    }

    setLineItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    
    // Calculate discount amount
    let discountAmount = 0;
    if (discountValue > 0) {
      if (discountType === 'percentage') {
        discountAmount = subtotal * (discountValue / 100);
      } else {
        discountAmount = discountValue;
      }
    }
    
    const discountedSubtotal = subtotal - discountAmount;
    const vatAmount = discountedSubtotal * 0.05;
    const total = discountedSubtotal + vatAmount;
    
    return { subtotal, discountAmount, discountedSubtotal, vatAmount, total };
  };

  // Check for existing invoice and redirect if found
  const handleInvoiceAction = async () => {
    // If in controlled mode, just check for existing invoice
    if (controlledOpen !== undefined) {
      try {
        const response = await fetch(`/api/invoices?proposalId=${proposal.id}`);
        if (response.ok) {
          const { invoices } = await response.json();
          if (invoices && invoices.length > 0) {
            const invoice = invoices[0];
            router.push(`/invoices/${invoice.id}`);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking existing invoice:", error);
      }
      // Dialog is already open in controlled mode
      return;
    }
    
    // Original behavior for uncontrolled mode
    try {
      const response = await fetch(`/api/invoices?proposalId=${proposal.id}`);
      if (response.ok) {
        const { invoices } = await response.json();
        if (invoices && invoices.length > 0) {
          const invoice = invoices[0];
          router.push(`/invoices/${invoice.id}`);
          return;
        }
      }
      setOpen(true);
    } catch (error) {
      console.error("Error checking existing invoice:", error);
      setOpen(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Create new invoice
      const request: CreateInvoiceRequest = {
        proposalId: proposal.id,
        dueDate,
        lineItems: lineItems.filter(
          (item) => item.description && item.lineTotal > 0,
        ),
        clientTrn: clientTrn || undefined,
        clientAddress: clientAddress || undefined,
        discountType: discountValue > 0 ? discountType : undefined,
        discountValue: discountValue > 0 ? discountValue : undefined,
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      const { invoice } = await response.json();

      setOpen(false);
      router.push(`/invoices/${invoice.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, discountAmount, discountedSubtotal, vatAmount, total } = calculateTotals();

  // Check for existing invoice when dialog opens in controlled mode
  useEffect(() => {
    if (controlledOpen && open) {
      const checkExistingInvoice = async () => {
        try {
          const response = await fetch(`/api/invoices?proposalId=${proposal.id}`);
          if (response.ok) {
            const { invoices } = await response.json();
            if (invoices && invoices.length > 0) {
              const invoice = invoices[0];
              router.push(`/invoices/${invoice.id}`);
              if (controlledOnOpenChange) {
                controlledOnOpenChange(false);
              }
            }
          }
        } catch (error) {
          console.error("Error checking existing invoice:", error);
        }
      };
      checkExistingInvoice();
    }
  }, [controlledOpen, open, proposal.id, router, controlledOnOpenChange]);

  return (
    <>
      {/* Custom trigger that handles the logic - only render if trigger is provided */}
      {trigger && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            handleInvoiceAction();
          }}
        >
          {trigger}
        </div>
      )}

      {/* Dialog only for creating new invoices */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Create an invoice for proposal {proposal.order_id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Client Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Client Name
                  </label>
                  <Input value={proposal.client_name} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Company Name
                  </label>
                  <Input value={proposal.company_name} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Client TRN (optional)
                  </label>
                  <Input
                    value={clientTrn}
                    onChange={(e) => setClientTrn(e.target.value)}
                    placeholder="Enter client's TRN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Client Address
                </label>
                <Textarea
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Enter client's business address"
                  rows={2}
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold">Invoice Items</h3>
                <Button onClick={addLineItem} size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-2 px-2 w-[40%] text-sm font-medium text-zinc-400">
                      Description
                    </th>
                    <th className="text-center py-2 px-2 w-[15%] text-sm font-medium text-zinc-400">
                      Quantity
                    </th>
                    <th className="text-right py-2 px-2 w-[15%] text-sm font-medium text-zinc-400">
                      Unit Price
                    </th>
                    <th className="text-right py-2 px-2 w-[15%] text-sm font-medium text-zinc-400">
                      Total
                    </th>
                    <th className="w-[15%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-zinc-800">
                      <td className="py-2 px-2">
                        <Input
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(index, "description", e.target.value)
                          }
                          placeholder="Item description"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(index, "quantity", e.target.value)
                          }
                          min="1"
                          className="text-center"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(index, "unitPrice", e.target.value)
                          }
                          min="0"
                          step="0.01"
                          className="text-right"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className="font-medium">
                          AED {item.lineTotal.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Discount Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Discount</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="absolute">Fixed Amount (AED)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Discount Value
                  </label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min="0"
                    step={discountType === 'percentage' ? '1' : '0.01'}
                    placeholder={discountType === 'percentage' ? '10' : '100.00'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Discount Amount
                  </label>
                  <Input
                    value={`AED ${discountAmount.toFixed(2)}`}
                    disabled
                    className=""
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4">
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>AED {subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountValue}{discountType === 'percentage' ? '%' : ' AED'}):</span>
                    <span>-AED {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>VAT (5%):</span>
                  <span>AED {vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>AED {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  loading || lineItems.every((item) => !item.description)
                }
              >
                {loading ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
