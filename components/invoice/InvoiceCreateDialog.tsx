"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import ClientSelector from "./ClientSelector";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: "create" | "edit";
  invoice?: any; // Existing invoice data for edit mode
}

export default function InvoiceCreateDialog({
  open,
  onClose,
  onSuccess,
  mode = "create",
  invoice,
}: InvoiceCreateDialogProps) {
  const [loading, setLoading] = useState(false);
  const [issueDate, setIssueDate] = useState<Date>(
    invoice?.issue_date ? new Date(invoice.issue_date) : new Date()
  );
  const [dueDate, setDueDate] = useState<Date>(
    invoice?.due_date ? new Date(invoice.due_date) : addDays(new Date(), 30)
  );
  const [isRecurring, setIsRecurring] = useState(invoice?.is_recurring || false);
  const [recurringInterval, setRecurringInterval] = useState(invoice?.recurring_interval || "monthly");
  const [clientData, setClientData] = useState({
    client_name: invoice?.client_name || "",
    client_company: invoice?.client_company || "",
    client_address: invoice?.client_address || "",
    client_trn: invoice?.client_trn || "",
  });
  const [notes, setNotes] = useState(invoice?.notes || "");
  const [discountType, setDiscountType] = useState<"percentage" | "absolute" | null>(
    invoice?.discount_type || null
  );
  const [discountValue, setDiscountValue] = useState(invoice?.discount_value || 0);
  const [applyVat, setApplyVat] = useState(invoice?.apply_vat ?? true);
  const [lineItems, setLineItems] = useState<LineItem[]>(
    invoice?.line_items?.map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price || item.unitPrice || 0,
      total: item.total || item.lineTotal || 0,
    })) || [
      { description: "", quantity: 1, unit_price: 0, total: 0 },
    ]
  );

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = () => {
    if (!discountType || discountValue <= 0) return 0;
    const subtotal = calculateSubtotal();
    return discountType === "percentage" 
      ? subtotal * (discountValue / 100)
      : discountValue;
  };

  const calculateVAT = () => {
    if (!applyVat) return 0;
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount) * 0.05;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const vat = calculateVAT();
    return subtotal - discount + vat;
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...lineItems];
    if (field === "quantity" || field === "unit_price") {
      updatedItems[index][field] = Number(value) || 0;
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    } else {
      updatedItems[index][field] = value as any;
    }
    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0, total: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!clientData.client_name || !clientData.client_company || !clientData.client_address) {
        toast.error("Please fill in all required client information");
        return;
      }

      const validLineItems = lineItems.filter(item => item.description && item.total > 0);
      if (validLineItems.length === 0) {
        toast.error("Please add at least one line item");
        return;
      }

      const invoiceData = {
        ...clientData,
        notes,
        issue_date: format(issueDate, "yyyy-MM-dd"),
        due_date: format(dueDate, "yyyy-MM-dd"),
        line_items: validLineItems,
        subtotal: calculateSubtotal(),
        discount_type: discountType,
        discount_value: discountValue,
        discount_amount: calculateDiscount(),
        apply_vat: applyVat,
        vat_amount: calculateVAT(),
        total_amount: calculateTotal(),
        is_recurring: isRecurring,
        recurring_interval: isRecurring ? recurringInterval : null,
        recurring_start_date: isRecurring ? format(issueDate, "yyyy-MM-dd") : null,
      };

      const url = mode === "create" ? "/api/invoices" : `/api/invoices/${invoice.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${mode} invoice`);
      }

      const data = await response.json();
      
      if (mode === "create") {
        toast.success(`Invoice ${data.invoice.invoice_number} created successfully`);
      } else {
        toast.success("Invoice updated successfully");
      }
      onSuccess();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create New Invoice" : `Edit Invoice #${invoice?.invoice_number}`}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          {mode === "create" ? (
            <ClientSelector 
              value={clientData}
              onChange={setClientData}
            />
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Client Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client Name</Label>
                  <Input value={clientData.client_name} disabled className="bg-zinc-700" />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input value={clientData.client_company} disabled className="bg-zinc-700" />
                </div>
                <div>
                  <Label>Client TRN</Label>
                  <Input
                    value={clientData.client_trn}
                    onChange={(e) => setClientData({...clientData, client_trn: e.target.value})}
                    placeholder="Enter TRN"
                  />
                </div>
                <div>
                  <Label>Client Address</Label>
                  <Textarea
                    value={clientData.client_address}
                    onChange={(e) => setClientData({...clientData, client_address: e.target.value})}
                    placeholder="Enter address"
                    rows={2}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invoice Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={format(issueDate, "yyyy-MM-dd")}
                  onChange={(e) => setIssueDate(new Date(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={format(dueDate, "yyyy-MM-dd")}
                  onChange={(e) => setDueDate(new Date(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Line Items</h3>
              <Button type="button" onClick={addLineItem} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            <div className="space-y-2">
              {lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                      placeholder="Service description"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Unit Price (AED)</Label>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleLineItemChange(index, "unit_price", e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Total (AED)</Label>
                    <Input value={item.total.toFixed(2)} readOnly className="bg-zinc-950" />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* VAT Section */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="apply_vat"
                checked={applyVat}
                onCheckedChange={(checked) => setApplyVat(checked as boolean)}
              />
              <Label htmlFor="apply_vat">Apply VAT (5%)</Label>
            </div>
          </div>

          {/* Discount Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Discount</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <Select 
                  value={discountType || "none"} 
                  onValueChange={(value) => setDiscountType(value === "none" ? null : value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Discount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="absolute">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {discountType && (
                <div>
                  <Label>
                    Discount Value {discountType === "percentage" ? "(%)" : "(AED)"}
                  </Label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min="0"
                    step={discountType === "percentage" ? "1" : "0.01"}
                    className="bg-zinc-950 border-zinc-800 text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>AED {calculateSubtotal().toFixed(2)}</span>
            </div>
            {discountType && discountValue > 0 && (
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span>-AED {calculateDiscount().toFixed(2)}</span>
              </div>
            )}
            {applyVat && (
              <div className="flex justify-between text-sm">
                <span>VAT (5%)</span>
                <span>AED {calculateVAT().toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>AED {calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Recurring Options - only show for create mode */}
          {mode === "create" && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                />
                <Label htmlFor="recurring">Make this a recurring invoice</Label>
              </div>
              {isRecurring && (
                <div>
                  <Label>Recurring Interval</Label>
                  <Select value={recurringInterval} onValueChange={setRecurringInterval}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or payment instructions..."
              rows={3}
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-400"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (mode === "create" ? "Creating..." : "Saving...") 
                : (mode === "create" ? "Create Invoice" : "Save Changes")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
