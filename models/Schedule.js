const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  scheduleTitle: { type: String, required: true },
  caseTitle: { type: String, required: true },
  assignedJudge: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Postponed', 'Cancelled'], default: 'Scheduled' },
  createdBy: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
