// models/Case.js
const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseTitle: {
    type: String,
    required: true
  },
  judge: {
    type: String,
    required: true
  },
  partiesInvolved: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Pending', 'Closed'],
    default: 'Open'
  },
  createdBy: {
    type: String,
    required: true
  },
  dateFiled: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Auto-update lastUpdated before save
caseSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Case', caseSchema);
