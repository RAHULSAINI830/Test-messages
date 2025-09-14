const { connect } = require('../../lib/db');
const Thread = require('../../models/Thread');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  const u = requireAuth(req, res); if (!u) return;
  await connect();
  const rows = await Thread.find({ userId: u.uid })
    .sort({ lastMessageAt: -1 })
    .limit(100);
  res.json(rows);
};
