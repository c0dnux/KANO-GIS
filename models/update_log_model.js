const mongoose = require("mongoose");

const updateLogSchema = new mongoose.Schema({
  updateType: {
    type: String,
    enum: ["CrimeReport", "User"],
    required: true,
  },
  recordId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    refPath: "updateType", // dynamically references 'CrimeReport' or 'User'
  },
  updatedFields: {
    type: [String], // e.g. ['status', 'location']
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const UpdateLog = mongoose.model("UpdateLog", updateLogSchema);
module.exports = UpdateLog;
