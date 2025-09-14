const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
