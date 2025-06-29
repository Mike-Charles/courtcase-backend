const express = require('express');
const router = express.Router();
const Case = require('../models/Case');

router.get('/', async (req, res) => {
  try {
    const cases = await Case.find();
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// POST new case
router.post('/', async (req, res) => {
  try {
    const newCase = new Case(req.body);
    await newCase.save();
    res.status(201).json(newCase);
  } catch (err) {
    console.error(err);  // 👈 This will show the validation error in terminal
    res.status(500).json({ error: err.message || 'Failed to create case' });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update case' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Case.findByIdAndDelete(req.params.id);
    res.json({ message: 'Case deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

// Get all cleared cases
router.get('/Closed', async (req, res) => {
  try {
    const closedCases = await Case.find({ status: 'Closed' });
    res.json(closedCases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch closed cases' });
  }
});

module.exports = router;
