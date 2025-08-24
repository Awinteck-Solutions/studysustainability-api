// schema/Survey.schema.ts

import mongoose from "mongoose";
const Schema = mongoose.Schema;

const SurveySchema = new Schema(
  {
    title: { type: String, required: false },
    description: { type: String, required: false },
    audience: { type: String, required: false },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "DEACTIVE", "DELETED"],
      default: "PENDING",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Survey = mongoose.model("Survey", SurveySchema);
export default Survey;
