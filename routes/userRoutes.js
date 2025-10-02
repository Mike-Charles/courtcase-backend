const express = require('express');
const router = express.Router();
const User = require('../models/User');



// Count total users
router.get("/count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error counting users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Count users by role
router.get("/roles/count", async (req, res) => {
  try {
    const roleCounts = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    const result = {};
    roleCounts.forEach(r => {
      result[r._id] = r.count;
    });
    res.json(result);
  } catch (err) {
    console.error("Error counting roles:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get recently created users (limit 5)
router.get("/recent", async (req, res) => {
  try {
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    res.json(recentUsers);
  } catch (err) {
    console.error("Error fetching recent users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all users
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Update user
router.put("/:id", async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedUser);
});

// Delete user
router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});





// Get all users (excluding passwords)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});


// Delete user by ID
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// ✅ FIXED: Correct user count route
router.get('/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Error counting users' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const user = new User({ name, email, password, role });
    const saved = await user.save();

    res.status(201).json({
      _id: saved._id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      createdAt: saved.createdAt
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error creating user' });
  }
});


// GET /api/users/roles/count
router.get('/roles/count', async (req, res) => {
  try {
    const roles = ['admin', 'clerk', 'judge', 'registrar', 'lawyer'];
    const roleCounts = {};

    for (const role of roles) {
      roleCounts[role] = await User.countDocuments({ role });
    }

    res.json(roleCounts);
  } catch (err) {
    console.error('Error fetching user role counts:', err);
    res.status(500).json({ message: 'Server error fetching user role counts' });
  }
});

// Get recent users (last 5 created)
router.get('/recent', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching recent users' });
  }
});


// GET all judges
router.get('/judges', async (req, res) => {
  try {
    const judges = await User.find({ role: 'judge' });
    res.json(judges);
  } catch (err) {
    console.error('Error fetching judges:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all judges
router.get("/judges", async (req, res) => {
  try {
    const judges = await User.find({ role: "Judge" });
    res.json(judges);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch judges" });
  }
});



module.exports = router;
