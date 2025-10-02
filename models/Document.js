const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Document", documentSchema);
