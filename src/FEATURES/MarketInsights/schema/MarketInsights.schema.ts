// schema/MarketInsights.schema.ts

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MarketInsightsSchema = new Schema(
  {
    insightType: { type: String, required: false },
    audience: { type: String, required: false },
    description: { type: String, required: false },
    data: { type: String, required: false },
    status: {
      type: String,
      enum: ['PENDING',"ACTIVE", "DEACTIVE", "DELETED"],
      default: "PENDING",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const MarketInsights = mongoose.model("MarketInsights", MarketInsightsSchema);
export default MarketInsights;
