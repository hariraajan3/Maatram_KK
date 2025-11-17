const { Pool } = require('pg');

let pool;

const getPool = () => {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set. Using mock DB; persistence disabled.');
    return null;
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
  return pool;
};

const runQuery = async (query, params = []) => {
  const activePool = getPool();
  if (!activePool) {
    return { rows: [], rowCount: 0 };
  }
  const client = await activePool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
};

module.exports = {
  runQuery,
};
