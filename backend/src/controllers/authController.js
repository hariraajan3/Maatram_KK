import { login } from '../middlewares/auth.js';

const loginHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await login(email, password);
    res.json({ token, user: { id: user.id, role: user.role, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};

const meHandler = (req, res) => {
  res.json({ user: { id: req.user.id, role: req.user.role, name: req.user.name, email: req.user.email } });
};

export { loginHandler, meHandler };
