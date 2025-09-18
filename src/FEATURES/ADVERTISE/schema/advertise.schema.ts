import mongoose from "mongoose";
import { status } from "../../AUTH/enums/status.enum";
import { generate6DigitID } from "../../../helpers/generate5DigitID";

const AdvertiseSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      unique: true,
      required: true,
      default: generate6DigitID,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: false,
    },
    advertType: {
      type: String,
      enum: ['landscape', 'portrait', 'square', 'strip', 'onload', 'header', 'footer'],
      required: true,
      default: 'landscape',
    },
    placement: {
      type: String,
      required: true,
      default: 'all',
    },
    targetAudience: {
      type: String,
      required: false,
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    // Image for display on website
    displayImage: {
      type: String,
      required: false,
    },
    // PDF file that opens when image is clicked
    pdfFile: {
      type: String,
      required: false,
    },
    // Optional: Link to external website instead of PDF
    externalLink: {
      type: String,
      required: false,
    },
    // Optional: Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
    },
    status: {
      type: String,
      enum: status,
      default: status.ACTIVE,
    },
  },
  { timestamps: true }
);

const AdvertiseModel = mongoose.model('Advertise', AdvertiseSchema);

export default AdvertiseModel;
