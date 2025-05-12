import mongoose from "mongoose";
import {delivery} from "../../UNIVERSITY_PROGRAMS/enums/delivery.enums";
import {status} from "../../AUTH/enums/status.enum";
import {generate6DigitID} from "../../../helpers/generate5DigitID";

const ProfessionalCourseSchema = new mongoose.Schema(
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
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "professional", // Reference to University model
      required: false, // Optional field
    },
    nameOfProvider: {type: String, required: false},
    nameOfCourse: {type: String, required: false},
    duration: {type: String, required: false},
    dates: {type: String, required: false}, 
    nextStartDate: {type: Date, required: false},
    fees: {type: String, required: false},
    paymentType: {type: String, enum: ["Full", "Installment"], required: false},
    disciplineCategory: {
      type: String,
      required: false,
    },
    industry: {
      type: String,
      required: false,
    },
    location: {type: String, required: false},
    deliveryType: {
      type: String,
      required: false,
    },
    cdpHour: {type: Number, required: false},
    aboutCourse: {type: String, required: false},
    courseContent: {type: String, required: false},
    whoShouldAttend: {type: String, required: false},
    uponCompletion: {type: String, required: false},
    accreditation: {type: String},
    registerInterestForm: {type: String},
    applyLink: {type: String},
    language: {
      type: String,
      required: false,
    },
    image: {type: String, required: false},
    howToApply: {type: String, required: false},
    status: {type: String, enum: status, default: status.ACTIVE},
  },
  {timestamps: true}
);

const ProfessionalCourseModel = mongoose.model(
  "ProfessionalCourse",
  ProfessionalCourseSchema
);

export default ProfessionalCourseModel;
