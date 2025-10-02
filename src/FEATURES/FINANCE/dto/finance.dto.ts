export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface CreateFinanceDto {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: ClientAddress;
  items: InvoiceItem[];
  taxRate?: number;
  discountRate?: number;
  dueDate: Date;
  notes?: string;
  total?: number;
  currency?: string;
  subtotal?: number;
  terms?: string;
  paymentMethod?: "STRIPE" | "BANK_TRANSFER" | "CASH" | "CHECK" | "OTHER";
}

export interface UpdateFinanceDto {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: ClientAddress;
  items?: InvoiceItem[];
  taxRate?: number;
  discountRate?: number;
  dueDate?: Date;
  notes?: string;
  terms?: string;
  paymentMethod?: "STRIPE" | "BANK_TRANSFER" | "CASH" | "CHECK" | "OTHER";
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
}

export interface FinanceResponseDto {
  _id: string;
  resourceId: string;
  author?: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: ClientAddress;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  paymentMethod: "STRIPE" | "BANK_TRANSFER" | "CASH" | "CHECK" | "OTHER";
  stripeInvoiceId?: string;
  stripePaymentIntentId?: string;
  stripePaymentLinkId?: string;
  stripePaymentLinkUrl?: string;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  terms?: string;
  status: "ACTIVE" | "INACTIVE" | "REJECTED" | "DELETED";
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface StripePaymentLinkDto {
  paymentLinkUrl: string;
  paymentLinkId: string;
  expiresAt?: Date;
}

export interface PaymentStatusUpdateDto {
  invoiceId: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  stripePaymentIntentId?: string;
  paidDate?: Date;
  notes?: string;
}
