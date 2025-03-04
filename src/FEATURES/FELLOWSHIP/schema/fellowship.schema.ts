import mongoose from "mongoose";
import { status } from "../../AUTH/enums/status.enum";
import { generate6DigitID } from "../../../helpers/generate5DigitID";


const FellowshipSchema = new mongoose.Schema(
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
    nameOfProvider: { type: String, required: false, default: 'N/A' },
    eventType: {
      type: String,
      required: false,
    },
    date: { type: String }, 
    duration: { type: String }, 
      titleOfFellowship: { type: String, required: true },
      deadline: { type: Date, required: false }, // Can be null for rolling applications
      summary: { type: String, required: false },
      benefits: { type: String, required: false },
      eligibility: { type: String, required: false },
      application: { type: String, required: false }, // Application process details
      moreInfoLink: { type: String, required: false }, 
      
        applyLink: { type: String },
        image: { type: String, required: false },
        status: { type: String, enum: status, default: status.ACTIVE },
        
  },
  { timestamps: true }
);

const FellowshipModel = mongoose.model('Fellowship', FellowshipSchema);

export default FellowshipModel


