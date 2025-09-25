const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Core app identity
  email: { type: String, unique: true, sparse: true }, // optional if you allow only OAuth/Telegram login
  passwordHash: String,

  // Linked provider accounts (Telegram, Slack, Discord, WhatsApp, etc.)
  accounts: [{
    provider: { type: String, enum: ['telegram', 'slack', 'discord', 'whatsapp'] },
    accessToken: String,
    botToken: String,
    metadata: Object
  }]
}, { timestamps: true });

// Prevent model overwrite in Vercel hot reload
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
