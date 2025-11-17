const bcrypt = require('bcryptjs');
const dataStore = require('../models/dataStore');
const { signToken, verifyToken } = require('../config/auth');

const authenticateCredentials = (email, password) => {
  const user = dataStore.users.find((candidate) => candidate.email === email);
  if (!user) return null;
  const match = bcrypt.compareSync(password, user.passwordHash);
  if (!match) return null;
  return user;
};

const login = (email, password) => {
  const user = authenticateCredentials(email, password);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const token = signToken({ id: user.id, role: user.role });
  return { user, token };
};

const withAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }
  try {
    const decoded = verifyToken(token);
    const user = dataStore.users.find((candidate) => candidate.id === decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  return next();
};

module.exports = {
  login,
  withAuth,
  requireRole,
};

