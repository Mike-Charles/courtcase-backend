const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["Unread", "Read"], default: "Unread" },
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);
