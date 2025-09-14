const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    provider: String,                 // 'telegram', 'slack', etc.
    providerThreadId: String,         // Telegram chat.id, Slack channel id, etc.
    title: String,
    lastMessageAt: Date,
  },
  { timestamps: true }
);

// Avoid duplicates per user/provider/chat
ThreadSchema.index({ userId: 1, provider: 1, providerThreadId: 1 }, { unique: true });

module.exports =mongoose.model.Thread|| mongoose.model('Thread', ThreadSchema);
