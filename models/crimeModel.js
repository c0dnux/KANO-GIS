const mongoose = require("mongoose");

const crimeReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
      default: () => `CR-${Date.now()}`,
    },

    description: {
      required: [true, "Description is required"],
      type: String,
    },
    crimeType: {
      required: [true, "Crime type is required"],
      type: String,

      enum: [
        "Theft",
        "Assault",
        "Fraud",
        "Murder",
        "Kidnapping",
        "Vandalism",
        "Other",
      ],
      default: "Other",
    },
    date: { required: [true, "Date is required"], type: Date, required: true },
    status: {
      type: String,
      enum: ["Unknown", "Under Investigation", "Resolved", "Closed"],
      default: "Unknown",
    },
    crimeAuth: {
      type: String,
      enum: ["pending", "verified", "fake"],
      default: "pending",
    },
    location: {
      address: { type: String, required: [true, "Address is required"] },
      city: { type: String, required: [true, "Area is required"] },
      localGovernment: String,
      state: { type: String, default: "Kano" },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
    },
    victims: Number,

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
crimeReportSchema.index({ location: "2dsphere" });
const CrimeReport = mongoose.model("CrimeReport", crimeReportSchema);

module.exports = CrimeReport;
