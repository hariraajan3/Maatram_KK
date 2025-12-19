import pg from 'pg';
const { Pool } = pg;

let pool;
let connectionTested = false;

const getPool = () => {
  if (pool) return pool;
  // Accept DATABASE_URL or DB_URL for flexibility
  const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;
  if (!dbUrl) {
    console.warn('⚠️  DATABASE_URL or DB_URL not set. Using mock DB; persistence disabled.');
    return null;
  }
  pool = new Pool({
    connectionString: dbUrl,
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
  try {
    const client = await activePool.connect();
    try {
      const result = await client.query(query, params);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database query failed:', error.message);
    throw error;
  }
};

export { runQuery };
