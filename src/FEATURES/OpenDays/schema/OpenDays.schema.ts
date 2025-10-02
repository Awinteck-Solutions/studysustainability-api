// schema/OpenDays.schema.ts

import mongoose from "mongoose";
import { status } from "../../AUTH/enums/status.enum";
const Schema = mongoose.Schema;

const OpenDaysSchema = new Schema(
  {
    title: { type: String, required: false },
    description: { type: String, required: false },
    city: { type: String, required: false },
    country: { type: String, required: false },
    image: { type: String, required: false }, // banner and image are the same
    mode: { type: String, required: false },
    link: { type: String, required: false },
    date: { type: Date, required: false },
    status: {type: String, enum: status, default: status.INACTIVE},
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const OpenDays = mongoose.model("OpenDays", OpenDaysSchema);
export default OpenDays;
