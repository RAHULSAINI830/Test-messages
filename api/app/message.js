const { connect } = require('../../lib/db');
const Message = require('../../models/Message');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  const u = requireAuth(req, res); if (!u) return;
  const { id } = req.query; // threadId
  await connect();
  const rows = await Message.find({ userId: u.uid, threadId: id }).sort({ sentAt: 1 });
  res.json(rows);
};
