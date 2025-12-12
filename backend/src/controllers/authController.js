const dataStore = require('../models/dataStore');
const { login } = require('../middlewares/auth');

const loginHandler = (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = login(email, password);
    res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};

const meHandler = (req, res) => {
  res.json({ user: { id: req.user.id, role: req.user.role, name: req.user.name, email: req.user.email } });
};

const listRoles = (_req, res) => {
  res.json({
    roles: ['admin', 'tutorLead', 'tutor', 'coordinator'],
  });
};

module.exports = {
  loginHandler,
  meHandler,
  listRoles,
};