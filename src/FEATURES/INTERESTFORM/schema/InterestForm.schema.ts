const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const InterestFormSchema = new Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: false },
    menuId: { type: mongoose.Schema.Types.ObjectId, required: false },
    menu: { type: String, required: false }, //Events, UniversityPrograms, jobs etc.
    firstname: { type: String, required: false },
    lastname: { type: String, required: false },
    email: { type: String, required: false },
    country: { type: String, required: false },
    city: { type: String, required: false },
    message: { type: String, required: false },
    status: {
        type: String,
        enum : ['ACTIVE','DEACTIVE'],
        default: 'ACTIVE',
    },
},  {timestamps: true})

const InterestForm = mongoose.model('InterestForm', InterestFormSchema);

export default InterestForm

       