const mongoose = require("mongoose");

const judgmentSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
  judgmentText: { type: String, required: true },
  verdict: { type: String, required: true },
  judgeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Judgment", judgmentSchema);
