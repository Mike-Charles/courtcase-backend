const express = require("express");
const multer = require("multer");
const Document = require("../models/Document");

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/cases"); // folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Upload document route
router.post("/upload/:caseId", upload.single("document"), async (req, res) => {
  try {
    const newDoc = new Document({
      caseId: req.params.caseId,
      fileName: req.file.originalname,
      filePath: `/uploads/cases/${req.file.filename}`,
    });

    await newDoc.save();
    res.status(201).json({ message: "Document uploaded successfully", newDoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error uploading document" });
  }
});

module.exports = router;
