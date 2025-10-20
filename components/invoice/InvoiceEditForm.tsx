"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";
import type { InvoiceLineItem } from "@/types/invoice";
import { Checkbox } from "@/components/ui/checkbox";

interface InvoiceEditFormProps {
  invoice: any; // Full invoice data from Supabase
}

export const InvoiceEditForm: React.FC<InvoiceEditFormProps> = ({ invoice }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [clientTrn, setClientTrn] = useState(invoice.client_trn || "");
  const [clientAddress, setClientAddress] = useState(invoice.client_address || "");
  const [dueDate, setDueDate] = useState(invoice.due_date);
  const [discountType, setDiscountType] = useState(invoice.discount_type || null);
  const [discountValue, setDiscountValue] = useState(invoice.discount_value || 0);
  const [applyVat, setApplyVat] = useState(invoice.apply_vat ?? true);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    invoice.line_items?.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price || item.unitPrice || 0,
      taxRate: item.taxRate || 5,
      lineTotal: item.total || item.lineTotal || 0,
    })) || []
  );

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
    value: string | number
  ) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      [field]: field === "description" ? value : Number(value),
    };
    
    // Recalculate line total
    if (field === "quantity" || field === "unitPrice") {
      updated[index].lineTotal = updated[index].quantity * updated[index].unitPrice;
    }
    
    setLineItems(updated);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    
    // Calculate discount
    let discountAmount = 0;
    if (discountType && discountValue > 0) {
      if (discountType === 'percentage') {
        discountAmount = subtotal * (discountValue / 100);
      } else {
        discountAmount = discountValue;
      }
    }
    
    const discountedSubtotal = subtotal - discountAmount;
    const vatAmount = applyVat ? discountedSubtotal * 0.05 : 0;
    const total = discountedSubtotal + vatAmount;
    
    return { subtotal, discountAmount, vatAmount, total };
  };

      console.log(clientAddress)
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const { subtotal, discountAmount, vatAmount, total } = calculateTotals();
      
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dueDate,
          lineItems: lineItems.filter(item => item.description && item.lineTotal > 0).map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            total: item.lineTotal,
          })),
          clientTrn: clientTrn,
          clientAddress: clientAddress,
          discount_type: discountType,
          discount_value: discountValue,
          discount_amount: discountAmount,
          apply_vat: applyVat,
          subtotal,
          vat_amount: vatAmount,
          total_amount: total,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update invoice");
      }

      router.push(`/invoices/${invoice.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Failed to update invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, discountAmount, vatAmount, total } = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto min-h-screen text-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/invoices/${invoice.id}`}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-zinc-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoice
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Edit Invoice #{invoice.invoice_number}
          </h1>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="bg-red-600 text-white hover:bg-red-700">
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="bg-zinc-800 rounded-lg shadow-md p-8 space-y-6">
        {/* Client Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Client Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Client Name</label>
              <Input value={invoice.client_name} disabled className="bg-zinc-700 border-zinc-600 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Company Name</label>
              <Input value={invoice.client_company} disabled className="bg-zinc-700 border-zinc-600 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Client TRN (optional)</label>
              <Input
                value={clientTrn}
                onChange={(e) => setClientTrn(e.target.value)}
                placeholder="Enter client's TRN"
                className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-zinc-700 border-zinc-600 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Client Address</label>
            <Textarea
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Enter client's business address"
              rows={2}
              className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Invoice Items</h3>
            <Button onClick={addLineItem} size="sm" variant="outline" className="border-zinc-600 bg-zinc-700 text-white hover:bg-zinc-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
          
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-600">
                <th className="text-left py-2 px-2 w-[40%] text-sm font-medium text-zinc-400">Description</th>
                <th className="text-center py-2 px-2 w-[15%] text-sm font-medium text-zinc-400">Quantity</th>
                <th className="text-right py-2 px-2 w-[15%] text-sm font-medium text-zinc-400">Unit Price</th>
                <th className="text-right py-2 px-2 w-[15%] text-sm font-medium text-zinc-400">Total</th>
                <th className="w-[15%]"></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index} className="border-b border-zinc-700">
                  <td className="py-2 px-2">
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(index, "description", e.target.value)
                      }
                      placeholder="Item description"
                      className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-400"
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
                      className="text-center bg-zinc-700 border-zinc-600 text-white"
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
                      className="text-right bg-zinc-700 border-zinc-600 text-white"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <span className="font-medium text-white">
                      AED {item.lineTotal.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                      className="text-zinc-400 hover:text-red-400 hover:bg-zinc-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VAT Section */}
        <div className="space-y-4 border-t border-zinc-600 pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="apply_vat"
              checked={applyVat}
              onCheckedChange={(checked) => setApplyVat(checked as boolean)}
            />
            <Label className="text-white">Apply VAT (5%)</Label>
          </div>
        </div>

        {/* Discount Section */}
        <div className="space-y-4 border-t border-zinc-600 pt-4">
          <h3 className="text-lg font-semibold text-white">Discount</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400">Discount Type</Label>
              <Select 
                value={discountType || "none"} 
                onValueChange={(value) => setDiscountType(value === "none" ? null : value as any)}
              >
                <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="none" className="text-white hover:bg-zinc-900">No Discount</SelectItem>
                  <SelectItem value="percentage" className="text-white hover:bg-zinc-900">Percentage</SelectItem>
                  <SelectItem value="absolute" className="text-white hover:bg-zinc-900">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {discountType && (
              <div>
                <Label className="text-zinc-400">
                  Discount Value {discountType === "percentage" ? "(%)" : "(AED)"}
                </Label>
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  min="0"
                  step={discountType === "percentage" ? "1" : "0.01"}
                  className="bg-zinc-700 border-zinc-600 text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-zinc-600 pt-4">
          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between">
              <span className="text-white">Subtotal:</span>
              <span className="text-white">AED {subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-white">Discount:</span>
                <span className="text-white">-AED {discountAmount.toFixed(2)}</span>
              </div>
            )}
            {applyVat && (
              <div className="flex justify-between">
                <span className="text-white">VAT (5%):</span>
                <span className="text-white">AED {vatAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t border-zinc-600 pt-2">
              <span className="text-white">Total:</span>
              <span className="text-red-400">AED {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
