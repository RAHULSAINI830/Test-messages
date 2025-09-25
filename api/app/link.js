// api/app/link.js
const { connect } = require('../../lib/db');
const User = require('../../models/User');
const { requireAuth } = require('../../lib/auth');

module.exports = async (req, res) => {
  const u = requireAuth(req, res);
  if (!u) return;

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { provider, ...metadata } = req.body;

  if (!provider) {
    return res.status(400).json({ ok: false, error: 'Provider is required' });
  }

  await connect();

  const user = await User.findById(u.uid);
  if (!user) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }

  const existingAccount = user.accounts.find(acc => acc.provider === provider);
  if (existingAccount) {
    Object.assign(existingAccount, { ...metadata });
  } else {
    user.accounts.push({ provider, ...metadata });
  }

  await user.save();

  res.json({ ok: true, user });
};