const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const Case = require("../models/Case");

// GET - fetch notifications for a specific judge, with case info populated
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .populate("caseId", "caseNumber title status") // populate the case info
      .sort({ sentAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
});

// PATCH - mark notification as read
router.patch("/read/:notificationId", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { status: "Read" },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST - sync assigned cases that are missing in notifications
router.post("/sync/:judgeId", async (req, res) => {
  try {
    const { judgeId } = req.params;

    // Find all assigned cases for this judge
    const assignedCases = await Case.find({ assignedJudge: judgeId, status: "Assigned" });

    const notificationsToCreate = [];

    for (const c of assignedCases) {
      const exists = await Notification.findOne({ userId: judgeId, caseId: c._id });
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
