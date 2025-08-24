const mongoose = require('mongoose')
const Schema = mongoose.Schema;


const EmailCampaignSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    image: { type: String, required: false }, // replaces 'banner'
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "DEACTIVE", "DELETED"],
      default: "PENDING",
    },
},  {timestamps: true})

const EmailCampaign = mongoose.model('EmailCampaign', EmailCampaignSchema);

export default EmailCampaign

       