const { Pool } = require('pg');

let pool;
let connectionTested = false;

const getPool = () => {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not set. Using mock DB; persistence disabled.');
    return null;
  }
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  // Test connection on first pool creation
  if (!connectionTested) {
    connectionTested = true;
    testConnection();
  }

  return pool;
};

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Run "npm run db:test" to diagnose the issue');
  }
}

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
