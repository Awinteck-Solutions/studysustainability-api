import mongoose from "mongoose";

const EmailerSchema = new mongoose.Schema({
  resourceId: { type: String, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
  
  // Campaign Details
  campaignName: { type: String, required: true },
  subject: { type: String, required: true },
  fromName: { type: String, required: true },
  fromEmail: { type: String, required: true },
  replyToEmail: { type: String, required: false },
  
  // Email Content
  htmlContent: { type: String, required: true },
  textContent: { type: String, required: false },
  templateId: { type: String, required: false }, // Reference to email template
  
  // Recipients
  recipientType: { 
    type: String, 
    enum: ["INDIVIDUAL", "LIST", "SEGMENT", "ALL_SUBSCRIBERS"], 
    default: "INDIVIDUAL" 
  },
  recipients: [{
    email: { type: String, required: true },
    name: { type: String, required: false },
    status: { 
      type: String, 
      enum: ["PENDING", "SENT", "DELIVERED", "OPENED", "CLICKED", "BOUNCED", "FAILED"], 
      default: "PENDING" 
    },
    sentAt: { type: Date, required: false },
    deliveredAt: { type: Date, required: false },
    openedAt: { type: Date, required: false },
    clickedAt: { type: Date, required: false },
    bounceReason: { type: String, required: false },
    errorMessage: { type: String, required: false }
  }],
  
  // Campaign Settings
  scheduleType: { 
    type: String, 
    enum: ["IMMEDIATE", "SCHEDULED", "RECURRING"], 
    default: "IMMEDIATE" 
  },
  scheduledAt: { type: Date, required: false },
  recurringPattern: { 
    type: String, 
    enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"], 
    required: false 
  },
  recurringEndDate: { type: Date, required: false },
  
  // Tracking
  trackOpens: { type: Boolean, default: true },
  trackClicks: { type: Boolean, default: true },
  trackUnsubscribes: { type: Boolean, default: true },
  
  // Statistics
  totalRecipients: { type: Number, default: 0 },
  totalSent: { type: Number, default: 0 },
  totalDelivered: { type: Number, default: 0 },
  totalOpened: { type: Number, default: 0 },
  totalClicked: { type: Number, default: 0 },
  totalBounced: { type: Number, default: 0 },
  totalFailed: { type: Number, default: 0 },
  totalUnsubscribed: { type: Number, default: 0 },
  
  // Email Service Integration
  emailService: { 
    type: String, 
    enum: ["SENDGRID", "MAILGUN", "SES", "MAILCHIMP", "CONSTANT_CONTACT"], 
    default: "SENDGRID" 
  },
  serviceCampaignId: { type: String, required: false },
  serviceMessageId: { type: String, required: false },
  
  // Campaign Status
  status: { 
    type: String, 
    enum: ["DRAFT", "SCHEDULED", "SENDING", "SENT", "PAUSED", "CANCELLED", "FAILED"], 
    default: "DRAFT" 
  },
  
  // Additional Information
  tags: [{ type: String }],
  description: { type: String, required: false },
  notes: { type: String, required: false },
  
  // Metadata
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Auto-generate resourceId
EmailerSchema.pre('save', async function(next) {
  if (!this.resourceId) {
    const { generate6DigitID } = await import("../../../helpers/generate5DigitID");
    this.resourceId = generate6DigitID();
  }
  next();
});

// Calculate recipient count before saving
EmailerSchema.pre('save', function(next) {
  this.totalRecipients = this.recipients.length;
  next();
});

// Index for better query performance
EmailerSchema.index({ status: 1, scheduledAt: 1 });
EmailerSchema.index({ author: 1, createdAt: -1 });
EmailerSchema.index({ "recipients.email": 1 });

export default mongoose.model("Emailer", EmailerSchema);
