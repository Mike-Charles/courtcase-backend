// routes/scheduleRoutes.js
const express = require("express");
const Schedule = require("../models/Schedule");
const Case = require("../models/Case");

const router = express.Router();

/**
 * 📌 Helper: Auto-update status based on current date
 */
const updateScheduleStatus = (schedule) => {
  const now = new Date();

  let status = "Scheduled";
  const start = new Date(schedule.startDate);
  const end = new Date(schedule.endDate);

  if (now >= start && now < end) status = "In Progress";
  else if (now >= end) status = "Closed";

  return { ...schedule._doc, status };
};

/**
 * 📌 Create a new schedule
 */
router.post("/", async (req, res) => {
  try {
    const { caseId, assignedJudge, startDate, startTime, endDate, endTime, room } = req.body;

    if (!caseId || !assignedJudge || !startDate || !startTime || !endDate || !endTime || !room) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newSchedule = new Schedule({
      caseId,
      assignedJudge,
      startDate,
      startTime,
      endDate,
      endTime,
      room,
    });

    await newSchedule.save();

    // Update case status
    await Case.findByIdAndUpdate(caseId, { status: "Scheduled" });

    res.status(201).json({ message: "Hearing scheduled successfully!", schedule: newSchedule });
  } catch (err) {
    console.error("Error scheduling hearing:", err);
    res.status(500).json({ error: "Failed to schedule hearing" });
  }
});

/**
 * 📌 Get all schedules (any status)
 */
router.get("/", async (req, res) => {
  try {
    let schedules = await Schedule.find()
      .populate("caseId", "caseNumber title status")
      .populate("assignedJudge", "name email")
      .sort({ startDate: 1, startTime: 1 });

    schedules = schedules.map(updateScheduleStatus);

    res.json(schedules);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules" });
  }
});

/**
 * 📌 Get schedules for a specific judge
 */
router.get("/judge/:judgeId", async (req, res) => {
  try {
    const { judgeId } = req.params;

    let schedules = await Schedule.find({ assignedJudge: judgeId })
      .populate("caseId", "caseNumber title status")
      .populate("assignedJudge", "name email")
      .sort({ startDate: 1, startTime: 1 });

    schedules = schedules.map(updateScheduleStatus);

    res.json(schedules);
  } catch (err) {
    console.error("Error fetching judge schedules:", err);
    res.status(500).json({ error: "Failed to fetch judge schedules" });
  }
});

/**
 * 📌 Get schedules with progress info for a judge
 */
router.get("/progress/:judgeId", async (req, res) => {
  try {
    const { judgeId } = req.params;

    const schedules = await Schedule.find({ assignedJudge: judgeId })
      .populate("caseId", "caseNumber title status")
      .populate("assignedJudge", "name email")
      .sort({ startDate: 1, startTime: 1 });

    const now = new Date();
    const updatedSchedules = schedules.map((s) => {
      let status = "Scheduled";
      let progress = 50;
      let color = "green";

      if (now >= new Date(s.startDate) && now < new Date(s.endDate)) {
        status = "In Progress";
        progress = 80;
        color = "yellow";
      } else if (now >= new Date(s.endDate)) {
        status = "Closed";
        progress = 100;
        color = "red";
      }

      return {
        ...s._doc,
        status,
        progress,
        color,
      };
    });

    res.json(updatedSchedules);
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ error: "Failed to fetch progress cases" });
  }
});

module.exports = router;
