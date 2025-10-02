import mongoose from "mongoose";

// Dashboard Analytics Schema for storing aggregated statistics
const DashboardAnalyticsSchema = new mongoose.Schema({
  resourceId: { type: String, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: false },
  
  // Analytics Type
  analyticsType: { 
    type: String, 
    enum: ["OVERALL_STATS", "USER_REGISTRATIONS", "ADS_CAMPAIGNS", "ADS_REQUESTS", "WEBSITE_FEEDBACKS", "PDF_DOWNLOADS", "EMAIL_CAMPAIGNS", "EMAIL_REQUESTS"], 
    required: true 
  },
  
  // Time Period
  period: { 
    type: String, 
    enum: ["7d", "30d", "90d", "1y", "custom"], 
    default: "30d" 
  },
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
  
  // Overall Statistics Data
  overallStats: {
    totalUsers: { type: Number, default: 0 },
    adsCampaigns: { type: Number, default: 0 },
    adsRequests: { type: Number, default: 0 },
    websiteFeedbacks: { type: Number, default: 0 },
    pdfDownloads: { type: Number, default: 0 },
    emailCampaigns: { type: Number, default: 0 },
    emailRequests: { type: Number, default: 0 }
  },
  
  // User Registration Analytics Data
  userRegistrations: [{
    date: { type: Date, required: true },
    students: { type: Number, default: 0 },
    universities: { type: Number, default: 0 },
    providers: { type: Number, default: 0 },
    eventOrganisers: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  }],
  
  // Individual Metrics Data
  individualMetrics: {
    adsCampaigns: [{
      date: { type: Date, required: true },
      count: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      paused: { type: Number, default: 0 },
      completed: { type: Number, default: 0 }
    }],
    adsRequests: [{
      date: { type: Date, required: true },
      count: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 }
    }],
    websiteFeedbacks: [{
      date: { type: Date, required: true },
      count: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      positive: { type: Number, default: 0 }, // rating >= 4
      negative: { type: Number, default: 0 }  // rating <= 2
    }],
    pdfDownloads: [{
      date: { type: Date, required: true },
      count: { type: Number, default: 0 },
      uniqueDownloads: { type: Number, default: 0 },
      totalDownloads: { type: Number, default: 0 }
    }],
    emailCampaigns: [{
      date: { type: Date, required: true },
      count: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      scheduled: { type: Number, default: 0 },
      draft: { type: Number, default: 0 }
    }],
    emailRequests: [{
      date: { type: Date, required: true },
      count: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
      processed: { type: Number, default: 0 }
    }]
  },
  
  // Cache Information
  lastUpdated: { type: Date, default: Date.now },
  cacheExpiry: { type: Date, required: false },
  
  // Status
  status: { 
    type: String, 
    enum: ["ACTIVE", "INACTIVE", "REJECTED", "DELETED"], 
    default: "ACTIVE" 
  },
  
  // Metadata
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Auto-generate resourceId
DashboardAnalyticsSchema.pre('save', async function(next) {
  if (!this.resourceId) {
    const { generate6DigitID } = await import("../../../helpers/generate5DigitID");
    this.resourceId = generate6DigitID();
  }
  next();
});

// Index for better query performance
DashboardAnalyticsSchema.index({ analyticsType: 1, period: 1, startDate: 1, endDate: 1 });
DashboardAnalyticsSchema.index({ lastUpdated: 1 });
DashboardAnalyticsSchema.index({ status: 1 });

export default mongoose.model("DashboardAnalytics", DashboardAnalyticsSchema);
