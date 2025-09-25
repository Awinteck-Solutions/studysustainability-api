import mongoose from "mongoose";
import { status } from "../../AUTH/enums/status.enum";
import { generate6DigitID } from "../../../helpers/generate5DigitID";

const WebsiteFeedbackSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      unique: true,
      required: true,
      default: generate6DigitID,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    pageURL: {
      type: String,
      required: false,
      trim: true,
    },
    yourFeedback: {
      type: String,
      required: false,
      trim: true,
    },
    fullname: {
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
    contactByEmail: {
      type: Boolean,
      default: false,
    },
    easeOfUse: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
    design: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
    informationAccuracy: {
      type: Number,
      required: false,
      min: 1,
      max: 5,
    },
    additionComments: {
      type: String,
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

const WebsiteFeedbackModel = mongoose.model("WebsiteFeedback", WebsiteFeedbackSchema);

export default WebsiteFeedbackModel;
