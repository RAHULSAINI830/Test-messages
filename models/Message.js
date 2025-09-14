const mongoose = require('mongoose');



const schema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: 'User' },
  provider: String,                     // 'telegram'
  providerMessageId: String,            // message_id
  threadId: { type: mongoose.Types.ObjectId, ref: 'Thread' },
  direction: { type: String, enum: ['in','out'] }, // incoming/outgoing
  senderName: String,
  senderId: String,
  text: String,
  attachments: [Object],
  sentAt: Date,
  raw: Object,
}, { timestamps: true });

schema.index({ provider:1, providerMessageId:1 }, { unique: true });
module.exports =  mongoose.models.Message||mongoose.model('Message', schema);
