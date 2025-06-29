const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule'); // Make sure you have Schedule model

// GET all schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ date: 1, time: 1 });
    res.status(200).json(schedules);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ error: 'Server error while fetching schedules' });
  }
});

// POST create a new schedule
router.post('/', async (req, res) => {
  const {
    scheduleTitle,
    caseTitle,
    assignedJudge,
    date,
    time,
    location,
    status,
    createdBy,
  } = req.body;

  try {
    const newSchedule = new Schedule({
      scheduleTitle,
      caseTitle,
      assignedJudge,
      date,
      time,
      location,
      status,
      createdBy,
    });
    const savedSchedule = await newSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (err) {
    console.error('Error creating schedule:', err);
    res.status(500).json({ error: 'Server error while creating schedule' });
  }
});

// PUT update a schedule by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.status(200).json(updatedSchedule);
  } catch (err) {
    console.error('Error updating schedule:', err);
    res.status(500).json({ error: 'Server error while updating schedule' });
  }
});

// DELETE a schedule by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    res.status(500).json({ error: 'Server error while deleting schedule' });
  }
});

module.exports = router;
