const express = require("express");
const router = express.Router();
const Judgment = require("../models/Judgment");
const Case = require("../models/Case");

// Add a new judgment
router.post("/", async (req, res) => {
  try {
    const { caseId, judgmentText, verdict, judgeId } = req.body;

    if (!caseId || !judgmentText || !verdict || !judgeId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newJudgment = new Judgment({
      caseId,
      judgmentText,
      verdict,
      judgeId,
    });

    await newJudgment.save();

    // Also update the case status
    await Case.findByIdAndUpdate(caseId, { status: "Judged" });

    res.status(201).json({ message: "Judgment submitted", judgment: newJudgment });
  } catch (err) {
    console.error("Error creating judgment:", err);
    res.status(500).json({ error: "Server error submitting judgment" });
  }
});

module.exports = router;
