const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'maatram-kk-secret';
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '8h';

const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = {
  JWT_SECRET,
  TOKEN_TTL,
  signToken,
  verifyToken,
};
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticate };