import mongoose from "mongoose";
import { delivery } from "../../UNIVERSITY_PROGRAMS/enums/delivery.enums";
import { status } from "../../AUTH/enums/status.enum";
import { generate6DigitID } from "../../../helpers/generate5DigitID";


const FreeCourseSchema = new mongoose.Schema(
  {
     resourceId: {
          type: String,
          unique: true,
          required: true,
      default: generate6DigitID,
      index: true
        },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin", 
      required: false,
  },
      
    nameOfInstitution: { type: String, required: false,index: true },
    titleOfCourse: { type: String, required: false ,index: true},
    language: {
      type: String,
      required: false,
    },
    certificate: { type: Boolean, required: false },
    discipline: {
      type: String,
      required: false,
    },
    module: { type: String, required: false, index: true },
    nextStartDate: { type: Date, required: false },
    location: { type: String, required: false },
    delivery: {
      type: String,
      enum: delivery,
      required: false,
    },
    duration: {
      type: Number,
      required: false, index: true
        },
    
    image: { type: String, required: false },

    assessment: { type: Boolean, required: false },
    aboutCourse: { type: String, required: false },
    courseContent: { type: String, required: false },
        instructorDetails: { type: String, required: false },
        howToApply: { type: String, required: false },
    registerInterestForm: { type: String },
        applyLink: { type: String },
        status: { type: String, enum: status, default: status.ACTIVE },
        
  },
  { timestamps: true }
);

const FreeCourseModel = mongoose.model('FreeCourse', FreeCourseSchema);

export default FreeCourseModel
