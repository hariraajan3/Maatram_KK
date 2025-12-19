import crypto from 'crypto';

const AES_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

const getAesKey = () => {
  const secret = process.env.AES_SECRET || 'maatram-kk-dev-secret';
  return crypto.createHash('sha256').update(secret).digest().subarray(0, KEY_LENGTH);
};

const serializePayload = (iv, tag, content) =>
  `${iv.toString('base64')}:${tag.toString('base64')}:${content.toString('base64')}`;

const parsePayload = (payload) => {
  const [iv, tag, content] = payload.split(':').map((part) => Buffer.from(part, 'base64'));
  if (!iv || !tag || !content) {
    throw new Error('Invalid encrypted payload structure');
  }
  return { iv, tag, content };
};

const encrypt = (plainText = '') => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(AES_ALGORITHM, getAesKey(), iv);
  const content = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return serializePayload(iv, tag, content);
};

const decrypt = (payload = '') => {
  if (!payload) return '';
  const { iv, tag, content } = parsePayload(payload);
  const decipher = crypto.createDecipheriv(AES_ALGORITHM, getAesKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
  return decrypted.toString('utf8');
};

const maskValue = (value = '', visible = 4) => {
  if (!value) return '';
  const last = value.slice(-visible);
  return `${'*'.repeat(Math.max(value.length - visible, 0))}${last}`;
};

export { encrypt, decrypt, maskValue };

