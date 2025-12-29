import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import pg from 'pg';

const { Pool } = pg;

// Get connection string from environment
const connectionString = process.env.DATABASE_URL || '';

// Check if SSL is required (for Neon and similar providers)
const needsSSL = connectionString.includes('sslmode=require') || process.env.DB_SSL === 'true';

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString,
    ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
});

// Create Prisma adapter with the pool
const adapter = new PrismaPg(pool);

// Create Prisma Client with adapter
const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
    await pool.end();
});

export default prisma;