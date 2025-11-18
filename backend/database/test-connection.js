/**
 * Database Connection Test Script
 * This script tests the connection to PostgreSQL database
 */

require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in your .env file!');
    console.log('\n📝 Please create a .env file in the backend directory with:');
    console.log('DATABASE_URL=postgresql://username:password@localhost:5432/maatram_kk\n');
    process.exit(1);
  }

  console.log('🔌 Testing database connection...');
  console.log(`📍 Database URL: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    // Test query
    const result = await client.query('SELECT version()');
    console.log(`📊 PostgreSQL Version: ${result.rows[0].version.split(',')[0]}`);

    // Check if database has tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (tablesResult.rows.length > 0) {
      console.log(`\n📋 Found ${tablesResult.rows.length} table(s) in database:`);
      tablesResult.rows.forEach((row) => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('\n⚠️  No tables found. Run "npm run db:setup" to create the schema.');
    }

    client.release();
    await pool.end();
    console.log('\n✨ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to connect to database:');
    console.error(`   Error: ${error.message}\n`);

    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Troubleshooting:');
      console.log('   - Make sure PostgreSQL is running');
      console.log('   - Check if the host and port are correct');
      console.log('   - Verify PostgreSQL service is started\n');
    } else if (error.code === '28P01') {
      console.log('💡 Troubleshooting:');
      console.log('   - Check your username and password in DATABASE_URL');
      console.log('   - Verify the credentials are correct\n');
    } else if (error.code === '3D000') {
      console.log('💡 Troubleshooting:');
      console.log('   - Database does not exist');
      console.log('   - Create it with: CREATE DATABASE maatram_kk;\n');
    } else {
      console.log('💡 Troubleshooting:');
      console.log('   - Verify DATABASE_URL format: postgresql://user:password@host:port/database');
      console.log('   - Check PostgreSQL logs for more details\n');
    }

    await pool.end();
    process.exit(1);
  }
}

testConnection();

