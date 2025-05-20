import mongoose from "mongoose";
import { status } from "../../AUTH/enums/status.enum";
import { generate6DigitID } from "../../../helpers/generate5DigitID";


const JobsSchema = new mongoose.Schema(
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
      jobCategory: {
        type: String,
        required: true,
      },
      employer: { type: String, required: true },
      jobTitle: { type: String, required: true },
      jobType: {
        type: String,
        required: true,
      },
      workPreference: {
        type: String,
        required: true,
      },
      experienceLevel: {
        type: String,
        required: true,
      },
      organizationType: {
        type: String,
        required: true,
      },
      industry: {
        type: String, 
        required: true,
      },
      location: { type: String, required: false }, // City
      country: { type: String, required: false }, // Country
      salary: { type: Number, required: false }, // Salary value
      salaryRange: { type: String, required: false }, // Range format e.g. "$50,000 - $70,000"
      datePosted: { type: Date, default: Date.now },
      aboutCompany: { type: String, required: false },
      overviewOfRole: { type: String, required: false },
      jobDescription: { type: String, required: false },
      idealPersonSpecifications: { type: String, required: false },
      deadline: { type: Date, required: false },
      applyLink: { type: String, required: false }, 
        
        image: { type: String, required: false },
        status: { type: String, enum: status, default: status.ACTIVE },
        
  },
  { timestamps: true }
);

const JobsModel = mongoose.model('Jobs', JobsSchema);

export default JobsModel

 