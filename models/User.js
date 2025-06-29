const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  time_registered: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
