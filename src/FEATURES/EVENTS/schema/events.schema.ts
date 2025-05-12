import mongoose from "mongoose";
import { delivery } from "../../UNIVERSITY_PROGRAMS/enums/delivery.enums";
import { status } from "../../AUTH/enums/status.enum";
import { generate6DigitID } from "../../../helpers/generate5DigitID";


const EventsSchema = new mongoose.Schema(
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
      organiser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organiser", // Reference to University model
            required: false, // Optional field
    },
      
    nameOfProvider: { type: String, required: false }, // Optional for events that may not have a provider
    titleOfEvent: { type: String, required: true },
    eventType: {
      type: String,
      required: true,
    },
    details: { type: String }, // General event details
    duration: { type: String }, // E.g., "3 hours", "2 days"
    startDates: { type: String }, 
    endDates: { type: String },
    speakers: { type: String }, // Array of speaker names
    fees: { type: String }, // Can be a number if strict pricing is needed
    paymentOptions: { type: String }, // Describe options like "Full, Installment"
    deliveryFormat: {type: String},
    registrationLink: { type: String }, // URL for registration
    deadline: { type: Date }, // Application deadline for competitions, conferences, training
    summary: { type: String }, // Summary of the event
    benefits: { type: String }, // List of benefits for attendees
    eligibility: { type: String }, // Who is eligible to attend
    application: { type: String }, // Application process details
    moreInfoLink: { type: String },
       
      
    language: {
      type: String,
      required: false,
    },
    applyLink: { type: String },
    image: { type: String, required: false },
    howToApply: { type: String, required: false },
    status: { type: String, enum: status, default: status.ACTIVE },
        
  },
  { timestamps: true }
);

const EventsModel = mongoose.model('Events', EventsSchema);

export default EventsModel


