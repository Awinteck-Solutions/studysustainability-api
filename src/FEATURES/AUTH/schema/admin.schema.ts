import {Permission} from "../enums/permission.enum";
import {Roles} from "../enums/roles.enum";
import {status} from "../enums/status.enum";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdminSchema = new Schema(
  {
    email: {type: String, required: true, unique: true, index: true},
    password: {type: String, required: false},
    firstname: {type: String, default: null},
    lastname: {type: String, default: null},
    image: {type: String, default: null},
    otp: {type: String, required: true},
    role: {type: String, required: true, default: Roles.ADMIN},

    countryOfOrigin: {type: String},
    countryOfResidence: {type: String},
    cityOfResidence: {type: String},
    gender: {type: String},
    ageRange: {type: String},
    levelOfStudy: {type: String},
    academicProgramInterest: {type: String},
    graduateRecruitmentInterest: {type: String},
    qualificationType: {type: String},  
    organisationName: {type: String},
    fullname: {type: String},
    website: {type: String},
    extraEmail: {type: String},
    accreditation: {type: String},
    eventTypes: {type: Array},

    permissions: [{type: String, required: true, default: Permission.ALL}],
    status: {
      type: String,
      enum: status,
      default: status.ACTIVE,
    },
  },
  {timestamps: true}
);

const AdminModel = mongoose.model("admin", AdminSchema);

export default AdminModel;
