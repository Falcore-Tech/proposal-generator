export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface InvoiceData {
  invoiceNumber?: string;
  proposalId?: string;
  orderId: string;
  
  // Company (Issuer) Information
  issuerName: string;
  issuerAddress: string;
  issuerPhone: string;
  issuerTrn: string;
  
  // Client (Bill To) Information
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientTrn?: string;
  
  // Invoice Details
  issueDate: string;
  dueDate: string;
  currency: string;
  
  // Service/Product Details
  lineItems: InvoiceLineItem[];
  
  // Payment Information
  bankAccountHolder: string;
  iban: string;
  swiftCode: string;
  bankAddress: string;
  
  // Calculations
  subtotal: number;
  discountType?: 'percentage' | 'absolute';
  discountValue?: number;
  discountAmount?: number;
  applyVat?: boolean;
  vatAmount: number;
  totalAmount: number;
  
  // Status
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}

export interface CreateInvoiceRequest {
  proposalId: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  clientTrn?: string;
  clientAddress?: string;
  discountType?: 'percentage' | 'absolute';
  discountValue?: number;
  applyVat?: boolean;
}