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
      address: String,
      area: { type: String, required: [true, "Area is required"] },
      localGovernment: String,
      state: { type: String, default: "Kano" },
      coordinates: {
        lat: Number,
        lon: Number,
      },
    },
    victim: {
      name: String,
      gender: { type: String, enum: ["Male", "Female"] },
      age: Number,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const CrimeReport = mongoose.model("CrimeReport", crimeReportSchema);

module.exports = CrimeReport;
