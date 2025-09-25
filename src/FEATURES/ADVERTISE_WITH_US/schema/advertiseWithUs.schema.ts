import mongoose from "mongoose";
import { status } from "../../AUTH/enums/status.enum";
import { generate6DigitID } from "../../../helpers/generate5DigitID";

const AdvertiseWithUsSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      unique: true,
      required: true,
      default: generate6DigitID,
    },
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    targetAudience: {
      type: String,
      required: true,
      trim: true,
    },
    advertPurpose: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    readState: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: status,
      default: status.ACTIVE,
    },
  },
  { timestamps: true }
);

const AdvertiseWithUsModel = mongoose.model("AdvertiseWithUs", AdvertiseWithUsSchema);

export default AdvertiseWithUsModel;
