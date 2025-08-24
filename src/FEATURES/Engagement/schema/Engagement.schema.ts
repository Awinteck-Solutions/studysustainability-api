// schema/Engagement.schema.ts

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const EngagementSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    item: { type: Schema.Types.ObjectId, required: true },
    itemType: {
      type: String,
      enum: ["FELLOWSHIP", "EVENTS", "FREE_COURSE", "JOBS", "OPEN_DAYS","SCHOLARSHIP", 'UNIVERSITY','UNIVERSITY_PROGRAM'],
      required: true,
    },
    type: {
      type: String,
      enum: ["IMPRESSION", "VIEW", "DWELL_TIME"],
      required: true,
    },
    value: { type: Number }, // dwell time in seconds, or increment count

    // 📌 Metadata for analysis and fraud prevention
    meta: {
      ip: { type: String },
      userAgent: { type: String },
      device: { type: String }, // optional: "MOBILE", "DESKTOP", "TABLET", etc.
      referrer: { type: String }, // optional: track where they came from
    },
  },
  { timestamps: true }
);

const Engagement = mongoose.model("Engagement", EngagementSchema);

export default Engagement;
