import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma.js';
import { signToken, verifyToken } from '../config/auth.js';


const authenticateCredentials = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  // const salt = await bcrypt.genSalt(10);
  // const hash = await bcrypt.hash(password, salt);
  // console.log(hash);
  // // Store hash in your password DB
  // if (!user) return null;
  const match = await bcrypt.compare(password, user.password);

  if (!match) return null;
  return user;
};


//hariraajan@gmail.com pass: hari5426
//gsurya@gmail.com pass: surya3625
//yogab@mail.com pass: yoga2006
//sailesh@gmail.com pass: sailesh2005
//abdul@gmail.com pass: abdul2006
//madhan@gmail.com pass: madhan2006


const login = async (email, password) => {
  const user = await authenticateCredentials(email, password);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const token = signToken({ id: user.id, role: user.role });
  return { user, token };
};

const withAuth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }
  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
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

export { login, withAuth, requireRole };

