const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '8h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables. Please set it in your .env file.');
}

const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = {
  JWT_SECRET,
  TOKEN_TTL,
  signToken,
  verifyToken,
};