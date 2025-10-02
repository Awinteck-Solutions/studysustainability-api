import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema({
  resourceId: {
    type: String,
    required: true,
    unique: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "REJECTED", "DELETED"],
    default: "ACTIVE",
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Generate resourceId before saving
AnalyticsSchema.pre('save', async function(next) {
  if (!this.resourceId) {
    const { generate6DigitID } = await import("../../../helpers/generate5DigitID");
    this.resourceId = generate6DigitID();
  }
  next();
});

export default mongoose.model("Analytics", AnalyticsSchema);
