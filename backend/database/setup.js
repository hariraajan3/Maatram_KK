/**
 * Database Setup Script
 * This script creates the database schema and optionally seeds initial data
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('📦 Setting up database schema...');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query('BEGIN');
    await client.query(schemaSQL);
    await client.query('COMMIT');
    
    console.log('✅ Database schema created successfully!');
    
    // Optionally run seed data
    if (process.argv.includes('--seed')) {
      console.log('🌱 Seeding initial data...');
      // Note: You'll need to implement proper seeding with bcrypt and encryption
      console.log('⚠️  Seed data requires manual setup with proper password hashing and encryption');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('✨ Database setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

