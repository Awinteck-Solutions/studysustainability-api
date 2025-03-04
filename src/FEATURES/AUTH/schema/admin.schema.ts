import { Permission } from "../enums/permission.enum";
import { Roles } from "../enums/roles.enum";
import { status } from "../enums/status.enum";

const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const AdminSchema = new Schema({
    email: { type: String, required: true, unique: true, index: true},
    password: { type: String, required: false },
    firstname: {type: String, default: null},
    lastname: {type: String, default: null},
    image: {type: String, default: null},
    otp: { type: String, required: true },
    role: { type: String, required: true, default: Roles.ADMIN },
    permissions: [{ type: String, required: true, default: Permission.ALL }],
    status: {
        type: String,
        enum : status,
        default: status.ACTIVE,
    },
},  {timestamps: true})

const AdminModel = mongoose.model('Admin', AdminSchema);

export default AdminModel