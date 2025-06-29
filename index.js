const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const caseRoutes = require('./routes/caseRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/case_management_db', {
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
const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
