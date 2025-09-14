const jwt = require('jsonwebtoken');

function sign(user) {
  return jwt.sign({ uid: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) { res.status(401).send('No token'); return null; }
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { res.status(401).send('Bad token'); return null; }
}

module.exports = { sign, requireAuth };
