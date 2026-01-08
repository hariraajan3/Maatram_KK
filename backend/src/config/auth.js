import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables. Please set it in backend/config.env.');
}

const signToken = (payload, expiresIn = TOKEN_TTL) => jwt.sign(payload, JWT_SECRET, { expiresIn });
const verifyToken = (token) => {
  // console.log('Verifying with secret starting with:', JWT_SECRET.substring(0, 4));
  return jwt.verify(token, JWT_SECRET);
};

export { TOKEN_TTL, signToken, verifyToken };

