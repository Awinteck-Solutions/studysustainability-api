import mongoose from "mongoose";
import { generate6DigitID } from "../../../helpers/generate5DigitID";

const FinanceSchema = new mongoose.Schema({
  resourceId: { type: String, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
  // Invoice Details 
  // create default UUID value for invoiceNumber
  invoiceNumber: {
    type: String,
    unique: true,
  },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientPhone: { type: String, required: false },
  clientAddress: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    country: { type: String, required: false },
    postalCode: { type: String, required: false }
  },
  // Invoice Items
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  // Financial Details
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0 }, // Tax percentage
  taxAmount: { type: Number, default: 0 },
  discountRate: { type: Number, default: 0 }, // Discount percentage
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  // Payment Details
  paymentStatus: { 
    type: String, 
    enum: ["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED"], 
    default: "PENDING" 
  },
  paymentMethod: { 
    type: String, 
    enum: ["STRIPE", "BANK_TRANSFER", "CASH", "CHECK", "OTHER"], 
    default: "STRIPE" 
  },
  // Stripe Integration
  stripeInvoiceId: { type: String, required: false },
  stripePaymentIntentId: { type: String, required: false },
  stripePaymentLinkId: { type: String, required: false },
  stripePaymentLinkUrl: { type: String, required: false },
  // Dates
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date, required: false },
  // Additional Information
  notes: { type: String, required: false },
  terms: { type: String, required: false },
  status: { 
    type: String, 
    enum: ["ACTIVE", "INACTIVE", "REJECTED", "DELETED"], 
    default: "ACTIVE" 
  },
  // Metadata
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Auto-generate resourceId
FinanceSchema.pre('save', async function(next) {
  if (!this.resourceId) {
    const { generate6DigitID } = await import("../../../helpers/generate5DigitID");
    this.resourceId = generate6DigitID();
  }
  next();
});

// Auto-generate invoice number
FinanceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const { generate6DigitID } = await import("../../../helpers/generate5DigitID");
    this.invoiceNumber = generate6DigitID();
  }
  next();
});

// Calculate totals before saving
FinanceSchema.pre('save', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    item.total = item.quantity * item.unitPrice;
  });
  
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate tax amount (taxRate is already a decimal, e.g., 0.08 for 8%)
  this.taxAmount = this.subtotal * this.taxRate;
  
  // Calculate discount amount (discountRate is already a decimal, e.g., 0.05 for 5%)
  this.discountAmount = this.subtotal * this.discountRate;
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.taxAmount - this.discountAmount;
  
  next();
});

export default mongoose.model("Finance", FinanceSchema);
