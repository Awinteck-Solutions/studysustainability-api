const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DisplayAdvertSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: String, // URL or storage path to the banner image
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    advertType: {
      type: String,
      required: false,
    },
    dimension: {
      type: String, // e.g., "728x90", "300x250"
      required: false,
    },
    duration: {
      type: Number, 
      required: true,
    },
    amounts: {
      type: Number, // amount paid for the advert
      required: false,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "DEACTIVE", "DELETED"],
      default: "PENDING",
    },
  },
  {timestamps: true}
);

const DisplayAdvert = mongoose.model("DisplayAdvert", DisplayAdvertSchema);

export default DisplayAdvert;
