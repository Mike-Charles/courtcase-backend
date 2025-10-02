const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: {type: String},
  title: { type: String, required: true },
  description: { type: String },
  partiesInvolved: { type: String },
  filedByName: { type: String, required: true },
  status: { type: String, enum: ['Registered', 'Submitted', 'Approved', 'Disapproved', 'Assigned', 'Scheduled'], default: `Registered` },
  createdAt: { type: Date, default: Date.now },
  registrationNotes: { type: String },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedToRegistrar: { type: Boolean, default: false },
  assignedJudge: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedJudgeName: { type: String },
  endorsedBy: { type: String },
});

module.exports = mongoose.model('Case', caseSchema);
