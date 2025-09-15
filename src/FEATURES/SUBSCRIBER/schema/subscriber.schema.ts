import mongoose from "mongoose";
import { status } from "../../AUTH/enums/status.enum";
import { generate6DigitID } from "../../../helpers/generate5DigitID";

const SubscriberSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      unique: true,
      required: true,
      default: generate6DigitID,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: { 
      type: String, 
      enum: status, 
      default: status.ACTIVE 
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SubscriberModel = mongoose.model('Subscriber', SubscriberSchema);

export default SubscriberModel;
