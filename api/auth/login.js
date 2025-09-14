const { connect } = require('../../lib/db');
const User = require('../../models/User');
const bcrypt = require('bcrypt');
const { sign } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { email, password } = req.body || {};
  await connect();

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('No user');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).send('Bad creds');
  res.json({ token: sign(user), user: { id: user._id, email: user.email } });
};
