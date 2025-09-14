const { connect } = require('../../lib/db');
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const { sign } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).send('Email and password required');

  await connect();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });
  res.json({ token: sign(user), user: { id: user._id, email: user.email } });
};
