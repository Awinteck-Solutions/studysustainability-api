import mongoose from "mongoose";
import { status } from "../../AUTH/enums/status.enum";
 
const { v4: uuidv4 } = require('uuid');

// Function to generate a 6-digit unique ID
// Generate a unique 6-digit ID without BigInt
function generate6DigitID() {
  const uuid = uuidv4().replace(/-/g, '');
  const num = parseInt(uuid.substring(0, 8), 16) % 1000000; // Use the first 8 hex characters
  return num.toString().padStart(6, '0');
}


const CareerSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin", 
      required: false,
  },
    resourceId: {
      type: String,
      unique: true,
      required: true,
      default: generate6DigitID,
      index: true
    },
      titleOfPosition: {
        type: String,
        required: true,
        index: true
      },
      positionOverview: {
        type: String,
        required: true,
      },
      rolesAndResponsibilities: {
        type: String,
        required: true,
      },
      idealPersonSpecifications: {
        type: String,
        required: true,
      },
      industry: {
        type: String,
        required: true,
      },
      roleLevel: {
        type: String,
        required: true,
    },
      
        image: { type: String, required: false },
        status: { type: String, enum: status, default: status.ACTIVE },
        
  },
  { timestamps: true }
);

const CareerModel = mongoose.model('CareerCatalogue', CareerSchema);

export default CareerModel
