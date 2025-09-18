import { status } from "../../AUTH/enums/status.enum";
import { delivery } from "../enums/delivery.enums";
import { Disciplines } from "../enums/discipline.enums";
import { qualification } from "../enums/qualification.enums";
import { qualificationType } from "../enums/qualificationTypes.enums";
import { StudyTypes } from "../enums/studyTypes.enums";
const { v4: uuidv4 } = require('uuid');

// Function to generate a 6-digit unique ID
// Generate a unique 6-digit ID without BigInt
function generate6DigitID() {
    const uuid = uuidv4().replace(/-/g, '');
    const num = parseInt(uuid.substring(0, 8), 16) % 1000000; // Use the first 8 hex characters
    return num.toString().padStart(6, '0');
  }

const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const UniProgramSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin", 
        required: false,
    },
    university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin", // Reference to University model
        required: false, // Optional field
    },
    programId: {
        type: String,
        unique: true,
        required: true,
        default: generate6DigitID,
      },
    
    nameOfInstitution: { type: String, required: false },
    titleOfProgramme: { type: String, required: false },

    qualificationType: {
        type: String,
        // enum: qualificationType,
        required: false,
    },

    qualification: {
        type: String,
        // enum: qualification,
        required: false,
    },

    discipline: {
        type: String,
        // enum: Disciplines,
        required: false,
    },

    studyType: {
        type: String,
        // enum: StudyTypes, // Full-Time or Part-Time
        required: false,
    },

    startTerm: {
        type: String,
        // enum: Array.from({ length: 12 }, (_, i) => 
        // new Date(2025, i).toLocaleString('default', { month: 'long' }) + " " + new Date().getFullYear()
        // ),
        required: false,
    },

    location: { type: String, required: false },

    image: { type: String, required: false },

    delivery: {
        type: String,
        enum: delivery,
        required: false,
    },

    duration: {
        type: Number,
        enum: [1, 3, 6, 9, 12, 15, 18], // Duration in months
        required: false,
    },

    aboutCourse: { type: String, required: false },
    courseContent: { type: String, required: false },
    entryRequirements: { type: String, required: false },

    fees: {
        home: { type: Number, required: false },
        international: { type: Number, required: false },
    },

    language: {
        type: String,
        required: false,
    },
    
    scholarship: { type: String },
    accommodationDetails: { type: String },
    accreditationDetails: { type: String },
    openDays: [{ type: String }],
    careerPaths: [{ type: String }],

    registerInterest: { type: String },
    applyLink: { type: String },

    status: { type: String, enum:status, default: status.ACTIVE },
    },
    { timestamps: true }
);

const UniProgramModel = mongoose.model('UniProgram', UniProgramSchema);

export default UniProgramModel