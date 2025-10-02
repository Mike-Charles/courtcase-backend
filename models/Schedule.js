// models/Schedule.js
const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
  assignedJudge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endDate: { type: Date, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true },
  status: {
    type: String,
    enum: ["Scheduled", "In Progress", "Closed"],
    default: "Scheduled",
  },
});

module.exports = mongoose.model("Schedule", scheduleSchema);
