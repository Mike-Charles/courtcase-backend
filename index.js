const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const caseRoutes = require('./routes/caseRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

// Load environment variables (only needed for local dev)
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Use env variables, fallback to defaults for local dev
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/case_management_db';
const PORT = process.env.PORT || 3001;

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/schedules', scheduleRoutes);

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
