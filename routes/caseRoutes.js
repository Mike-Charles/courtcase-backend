// caseRoutes.js
const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const User = require("../models/User");
const Notification = require("../models/Notification");



// Get total cases count
router.get("/count", async (req, res) => {
  try {
    const count = await Case.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error fetching case count:", err);
    res.status(500).json({ message: "Server error fetching case count" });
  }
});

// Get closed cases count
router.get("/closed", async (req, res) => {
  try {
    const closedCount = await Case.countDocuments({ status: "Closed" });
    res.json({ closedCount });
  } catch (err) {
    console.error("Error fetching closed cases:", err);
    res.status(500).json({ message: "Server error fetching closed cases" });
  }
});





// Get all pending filed cases
router.get("/filings/pending", async (req, res) => {
  try {
    const cases = await Case.find({ status: "Filed" });
    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching filed cases" });
  }
});

// Manual case registration by clerk (walk-in)
router.post("/manual-register", async (req, res) => {
  try {
    const { title, description, partiesInvolved, filedByName } = req.body;

    if (!title || !filedByName) {
      return res.status(400).json({
        message: "Title and filedByName are required",
      });
    }

    const newCase = new Case({
      title,
      description,
      partiesInvolved,
      filedByName,
      status: "Filed",
    });

    const savedCase = await newCase.save();
    res.status(201).json(savedCase);
  } catch (err) {
    console.error("Error creating manual case:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Clerk registers the case
router.post("/register/:id", async (req, res) => {
  try {
    const { registrationNotes, clerkName } = req.body;

    const caseToUpdate = await Case.findById(req.params.id);
    if (!caseToUpdate) {
      return res.status(404).json({ message: "Case not found" });
    }

    caseToUpdate.status = "Registered";
    caseToUpdate.registrationNotes = registrationNotes;
    caseToUpdate.registeredByName = clerkName;

    await caseToUpdate.save();
    res.status(200).json({ message: "Case registered successfully" });
  } catch (error) {
    console.error("Error registering case:", error);
    res.status(500).json({ message: "Server error registering case" });
  }
});

// Submit registered case to registrar
router.post("/submit/:id", async (req, res) => {
  try {
    const caseToSubmit = await Case.findById(req.params.id);
    if (!caseToSubmit) {
      return res.status(404).json({ message: "Case not found" });
    }

    caseToSubmit.status = "Submitted";
    await caseToSubmit.save();
    res.status(200).json({ message: "Case submitted to registrar" });
  } catch (error) {
    console.error("Error submitting case:", error);
    res.status(500).json({ message: "Server error submitting case" });
  }
});

// Get all registered cases by clerks (byClerk)
router.get("/registered/byClerk", async (req, res) => {
  try {
    const registeredCases = await Case.find({ status: "Registered" });
    res.json(registeredCases);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error fetching registered cases",
    });
  }
});

// Endorse case and assign judge
router.post("/endorse/:caseId", async (req, res) => {
  const { caseId } = req.params;
  const { judgeId, registrarName } = req.body;

  try {
    const caseToUpdate = await Case.findById(caseId);
    if (!caseToUpdate) return res.status(404).json({ message: "Case not found" });

    const judge = await User.findById(judgeId);
    if (!judge || judge.role !== "judge") {
      return res.status(400).json({ message: "Invalid judge ID" });
    }

    caseToUpdate.assignedJudge = judge._id;
    caseToUpdate.assignedJudgeName = judge.name;
    caseToUpdate.endorsedBy = registrarName;
    caseToUpdate.status = "Assigned";

    await caseToUpdate.save();

    // ✅ Create notification here
    const notification = new Notification({
      userId: judge._id,
      caseId: caseToUpdate._id,
      title: caseToUpdate.title,
      message: `You have been assigned a new case: ${caseToUpdate.title} (#${caseToUpdate.caseNumber})`,
      status: "Unread",
      sentAt: new Date(),
    });

    await notification.save();

    res.json({
      message: "Case successfully endorsed, judge assigned, and notification created",
      case: caseToUpdate,
      notification,
    });
  } catch (error) {
    console.error("Error endorsing case:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Get all assigned cases
router.get("/endorsed", async (req, res) => {
  try {
    const assignedCases = await Case.find({ status: "Assigned" }).populate(
      "assignedJudge",
      "name"
    );
    res.json(assignedCases);
  } catch (err) {
    console.error("Error fetching assigned cases:", err);
    res.status(500).json({ message: "Server error fetching assigned cases" });
  }
});

// Get assigned cases for a judge
router.get("/assigned/:judgeId", async (req, res) => {
  try {
    const assignedCases = await Case.find({
      assignedJudge: req.params.judgeId,
      status: "Assigned",
    }).sort({ createdAt: -1 });
    res.json(assignedCases);
  } catch (err) {
    console.error("Error fetching assigned cases:", err);
    res.status(500).json({ message: "Server error fetching assigned cases" });
  }
});

// Get scheduled cases for a judge
router.get("/scheduled/:judgeId", async (req, res) => {
  try {
    const scheduledCases = await Case.find({
      assignedJudge: req.params.judgeId,
      status: "Scheduled",
      hearingDate: { $exists: true, $ne: null },
    }).sort({ hearingDate: 1 });
    res.json(scheduledCases);
  } catch (err) {
    console.error("Error fetching scheduled cases:", err);
    res.status(500).json({ message: "Server error fetching scheduled cases" });
  }
});




router.post("/manual-register", async (req, res) => {
  try {
    const { title, description, partiesInvolved, filedByName, registeredBy } = req.body;

    if (!title || !filedByName) {
      return res.status(400).json({ message: "Title and filedByName are required" });
    }

    const newCase = new Case({
      title,
      description,
      partiesInvolved,
      filedByName,
      status: "Registered",
      registeredBy,  // <-- save the clerk here
    });

    const savedCase = await newCase.save();
    res.status(201).json(savedCase);
  } catch (err) {
    console.error("Error creating manual case:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// POST - Register a new case
router.post("/", async (req, res) => {
  try {
    const {
      caseNumber,
      title,
      description,
      partiesInvolved,
      filedByName,
      registrationNotes,
      registeredBy,
    } = req.body;

    const newCase = new Case({
      caseNumber,
      title,
      description,
      partiesInvolved,
      filedByName,
      registrationNotes,
      registeredBy,
      status: "Registered",
    });

    await newCase.save();
    res.status(201).json({ message: "Case registered successfully!", newCase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to register case" });
  }
});

// GET - Get all cases
router.get("/", async (req, res) => {
  try {
    const cases = await Case.find().populate("registeredBy", "name email");
    res.json(cases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch cases" });
  }
});

// GET all registered cases for a specific clerk
router.get("/registered/byClerk/:clerkId", async (req, res) => {
  const { clerkId } = req.params;

  try {
    // Fetch only cases with status 'Registered' and registered by this clerk
    const cases = await Case.find({
      registeredBy: clerkId,
      status: "Registered",
    }).sort({ createdAt: -1 }); // optional: latest first

    res.json(cases);
  } catch (err) {
    console.error("Error fetching registered cases:", err);
    res.status(500).json({ message: "Server error" });
  }
});



router.put("/submit/:caseId", async (req, res) => {
  const { caseId } = req.params;
  const { clerkId, clerkName } = req.body; // send from frontend

  try {
    const existingCase = await Case.findById(caseId);
    if (!existingCase) return res.status(404).json({ message: "Case not found" });

    existingCase.status = "Submitted";
    existingCase.submittedToRegistrar = true;
    existingCase.submittedBy = clerkId;
    existingCase.submittedByName = clerkName;

    await existingCase.save();

    res.json({ message: "Case submitted to registrar successfully", case: existingCase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET submitted cases by clerk
router.get("/submitted/byClerk/:clerkId", async (req, res) => {
  const { clerkId } = req.params;

  try {
    const cases = await Case.find({
      registeredBy: clerkId,       // use registeredBy instead of submittedBy
      status: { $in: ["Submitted", "Approved", "Pending"] }
    }).sort({ createdAt: -1 });

    res.json(cases);
  } catch (err) {
    console.error("Error fetching submitted cases:", err);
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});

// Get all submitted cases
router.get("/submitted", async (req, res) => {
  try {
    const submittedCases = await Case.find({ status: "Submitted" });
    res.json(submittedCases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching submitted cases" });
  }
});

// Approve a case
router.post("/approve/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { registrarName } = req.body;

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        status: "Approved",
        submittedToRegistrar: true,
        registrarName,
      },
      { new: true }
    );

    if (!updatedCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.json({ message: "Case approved successfully", case: updatedCase });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve case" });
  }
});

// Disapprove a case
router.post("/disapprove/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { registrarName } = req.body;

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        status: "Disapproved",
        submittedToRegistrar: true,
        registrarName,
      },
      { new: true }
    );

    if (!updatedCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.json({ message: "Case disapproved successfully", case: updatedCase });
  } catch (err) {
    res.status(500).json({ error: "Failed to disapprove case" });
  }
});

// Fetch approved cases (ready for assignment)
router.get("/approved", async (req, res) => {
  try {
    const cases = await Case.find({ status: "Approved" });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch approved cases" });
  }
});

// Fetch disapproved cases
router.get("/disapproved", async (req, res) => {
  try {
    const cases = await Case.find({ status: "Disapproved" });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch disapproved cases" });
  }
});

// caseRoutes.js
router.get('/cases/:id', async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id); // or populate if needed
    if (!caseData) return res.status(404).json({ message: 'Case not found' });
    res.json(caseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get ALL cases
router.get("/", async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    console.error("Error fetching cases:", err);
    res.status(500).json({ message: "Server error fetching cases" });
  }
});

// ✅ Get a single case by ID
router.get("/:id", async (req, res) => {
  try {
    const caseRecord = await Case.findById(req.params.id);
    if (!caseRecord) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json(caseRecord);
  } catch (err) {
    console.error("Error fetching case:", err);
    res.status(500).json({ message: "Server error fetching case" });
  }
});

// ✅ Update case status (used after judgment)
router.put("/:id/updateStatus", async (req, res) => {
  try {
    const { status } = req.body;
    const caseRecord = await Case.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!caseRecord) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json(caseRecord);
  } catch (err) {
    console.error("Error updating case status:", err);
    res.status(500).json({ message: "Server error updating status" });
  }
});

// ✅ Create a new case
router.post("/", async (req, res) => {
  try {
    const newCase = new Case(req.body);
    await newCase.save();
    res.status(201).json(newCase);
  } catch (err) {
    console.error("Error creating case:", err);
    res.status(500).json({ message: "Server error creating case" });
  }
});

// ✅ Delete a case
router.delete("/:id", async (req, res) => {
  try {
    const caseRecord = await Case.findByIdAndDelete(req.params.id);
    if (!caseRecord) {
      return res.status(404).json({ message: "Case not found" });
    }
    res.json({ message: "Case deleted successfully" });
  } catch (err) {
    console.error("Error deleting case:", err);
    res.status(500).json({ message: "Server error deleting case" });
  }
});




router.post("/notifications/sync/:judgeId", async (req, res) => {
  try {
    const { judgeId } = req.params;

    const assignedCases = await Case.find({ assignedJudge: judgeId });

    const notificationsToCreate = [];

    for (const c of assignedCases) {
      const exists = await Notification.findOne({ caseId: c._id, userId: judgeId });
      if (!exists) {
        notificationsToCreate.push({
          userId: judgeId,
          caseId: c._id,
          title: c.title,
          message: `You have been assigned a new case: ${c.title} (#${c.caseNumber})`,
          status: "Unread",
          sentAt: new Date(),
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }

    res.json({ message: "Notifications synced", created: notificationsToCreate.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
