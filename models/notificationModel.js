const mongoose = require("mongoose");
const notificationSchema = new mongoose.Schema({
  crimeId: { type: mongoose.Schema.Types.ObjectId, ref: "CrimeReport" },

  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});
const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
