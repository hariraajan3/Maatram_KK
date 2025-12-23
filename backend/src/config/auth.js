import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '8h';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables. Please set it in backend/config.env.');
}

const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

export { TOKEN_TTL, signToken, verifyToken };

