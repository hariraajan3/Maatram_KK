# Database Setup Guide

This guide will help you set up the PostgreSQL database for the Maatram KK application.

## Prerequisites

1. **PostgreSQL installed** on your system
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres-maatram -e POSTGRES_PASSWORD=password -e POSTGRES_DB=maatram_kk -p 5432:5432 -d postgres`

2. **Node.js and npm** installed (already done if you're running the backend)

## Setup Steps

### 1. Create the Database

Connect to PostgreSQL and create the database:

```bash
# Using psql command line
psql -U postgres

# Then in psql:
CREATE DATABASE maatram_kk;
\q
```

Or using a GUI tool like pgAdmin or DBeaver.

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` in the backend directory:

```bash
cd backend
copy .env.example .env
```

Edit `.env` and update the `DATABASE_URL` with your PostgreSQL credentials:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/maatram_kk
```

Replace:
- `postgres` with your PostgreSQL username
- `your_password` with your PostgreSQL password
- `localhost:5432` with your database host and port (if different)
- `maatram_kk` with your database name

### 3. Run the Schema

Execute the schema SQL file to create all tables:

**Option A: Using psql command line**
```bash
psql -U postgres -d maatram_kk -f database/schema.sql
```

**Option B: Using a GUI tool**
- Open pgAdmin, DBeaver, or any PostgreSQL client
- Connect to your database
- Open and execute `database/schema.sql`

**Option C: Using Node.js script (recommended)**
```bash
cd backend
node database/setup.js
```

### 4. (Optional) Seed Initial Data

If you want to populate the database with initial test data, you can use the seed file. However, note that:
- Password hashes need to be generated using bcrypt
- Encrypted fields need to be encrypted using your encryption utility

You can create a seed script in Node.js that uses your application's utilities to properly hash passwords and encrypt sensitive data.

## Database Schema Overview

The database includes the following tables:

- **users**: User accounts and authentication
- **tutors**: Extended information for tutors
- **students**: Student information
- **classes**: Class scheduling
- **sessions**: Individual class sessions
- **onboarding_requests**: Tutor onboarding workflow
- **swap_requests**: Class swap requests
- **attendance**: Attendance records
- **archived_records**: Soft-deleted records

## Verification

After setup, you can verify the database connection by:

1. Starting your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Check the console - it should connect to the database without warnings.

3. If you see "DATABASE_URL not set. Using mock DB; persistence disabled." - check your `.env` file.

## Troubleshooting

### Connection Issues

- **Error: password authentication failed**
  - Check your PostgreSQL password in `.env`
  - Verify PostgreSQL is running: `pg_isready` or check service status

- **Error: database does not exist**
  - Create the database first (step 1)

- **Error: relation does not exist**
  - Run the schema.sql file (step 3)

### SSL Issues

If you're using a cloud database (like Heroku Postgres, AWS RDS, etc.), you may need to enable SSL:

```
DB_SSL=true
```

## Next Steps

After the database is set up:
1. Update your application code to use the database instead of the in-memory dataStore
2. Create proper model files that use the `runQuery` function from `config/database.js`
3. Migrate existing data if needed

