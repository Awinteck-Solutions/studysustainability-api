import mongoose from "mongoose";
import {delivery} from "../../UNIVERSITY_PROGRAMS/enums/delivery.enums";
import {status} from "../../AUTH/enums/status.enum";
import {generate6DigitID} from "../../../helpers/generate5DigitID";

const ScholarshipsSchema = new mongoose.Schema(
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
    titleOfScholarship: {type: String, required: true},
    nameOfProvider: {type: String, required: true},
    scholarshipType: {
      type: String,
      required: true,
    },
    deadline: {type: Date, required: false}, // Can be null for rolling applications
    summary: {type: String, required: false},
    benefits: {type: String, required: false},
    eligibility: {type: String, required: false},
    application: {type: String, required: false}, // Application process details
    moreInfoLink: {type: String, required: false}, // External link for details or application
    image: {type: String, required: false},
    applyLink: {type: String, required: false},
    status: {type: String, enum: status, default: status.ACTIVE},
  },
  {timestamps: true}
);

const ScholarshipsModel = mongoose.model("Scholarships", ScholarshipsSchema);

export default ScholarshipsModel;
