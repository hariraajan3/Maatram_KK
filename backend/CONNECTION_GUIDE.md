# How to Connect Backend to PostgreSQL Database

This guide will walk you through connecting your backend to PostgreSQL.

## Step-by-Step Instructions

### Step 1: Install PostgreSQL (if not already installed)

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or use Chocolatey: `choco install postgresql`

**Using Docker (Recommended):**
```bash
docker run --name postgres-maatram -e POSTGRES_PASSWORD=password -e POSTGRES_DB=maatram_kk -p 5432:5432 -d postgres
```

### Step 2: Create the Database

Open PowerShell or Command Prompt and run:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE maatram_kk;

# Exit psql
\q
```

**Alternative:** Use pgAdmin or any PostgreSQL GUI tool to create the database.

### Step 3: Create .env File

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file (copy from template):
   ```bash
   # Windows PowerShell
   Copy-Item ENV_TEMPLATE.txt .env
   
   # Or manually create .env file
   ```

3. Edit the `.env` file and update the `DATABASE_URL`:

   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/maatram_kk
   ```

   **Replace:**
   - `postgres` → Your PostgreSQL username (usually `postgres`)
   - `your_password` → Your PostgreSQL password
   - `localhost:5432` → Your database host and port (default is `localhost:5432`)
   - `maatram_kk` → Your database name

   **Example:**
   ```
   DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/maatram_kk
   ```

### Step 4: Test the Connection

Run the connection test script:

```bash
npm run db:test
```

You should see:
```
✅ Successfully connected to PostgreSQL!
```

If you see an error, check the troubleshooting section below.

### Step 5: Create Database Tables

Run the setup script to create all database tables:

```bash
npm run db:setup
```

You should see:
```
✅ Database schema created successfully!
```

### Step 6: Verify Connection in Your App

Start your backend server:

```bash
npm run dev
```

You should see in the console:
```
✅ Database connected successfully
Maatram KK API running on http://localhost:4000
```

If you see `⚠️ DATABASE_URL not set. Using mock DB; persistence disabled.`, check your `.env` file.

## Connection String Format

The `DATABASE_URL` follows this format:

```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

**Examples:**

- **Local PostgreSQL:**
  ```
  postgresql://postgres:password@localhost:5432/maatram_kk
  ```

- **Docker PostgreSQL:**
  ```
  postgresql://postgres:password@localhost:5432/maatram_kk
  ```

- **Cloud Database (with SSL):**
  ```
  postgresql://user:pass@db.example.com:5432/maatram_kk
  ```
  And add to `.env`:
  ```
  DB_SSL=true
  ```

## Troubleshooting

### Error: "DATABASE_URL not set"

**Solution:**
- Make sure you created a `.env` file in the `backend` directory
- Check that the file is named exactly `.env` (not `.env.txt`)
- Verify the `DATABASE_URL` line is not commented out (no `#` at the start)

### Error: "password authentication failed"

**Solution:**
- Double-check your PostgreSQL password in the `DATABASE_URL`
- Try connecting with psql to verify credentials:
  ```bash
  psql -U postgres -d maatram_kk
  ```

### Error: "database does not exist"

**Solution:**
- Create the database first:
  ```bash
  psql -U postgres
  CREATE DATABASE maatram_kk;
  \q
  ```

### Error: "ECONNREFUSED" or "Connection refused"

**Solution:**
- Make sure PostgreSQL is running
- Check if PostgreSQL service is started:
  ```bash
  # Windows
  Get-Service postgresql*
  
  # Or check in Services app
  ```
- Verify the port (default is 5432)
- Check firewall settings

### Error: "relation does not exist"

**Solution:**
- Run the database setup:
  ```bash
  npm run db:setup
  ```

### Connection works but shows "Using mock DB"

**Solution:**
- Make sure `.env` file is in the `backend` directory (same level as `package.json`)
- Restart your server after creating/editing `.env`
- Check for typos in `DATABASE_URL`

## Quick Verification Checklist

- [ ] PostgreSQL is installed and running
- [ ] Database `maatram_kk` exists
- [ ] `.env` file exists in `backend` directory
- [ ] `DATABASE_URL` is correctly formatted in `.env`
- [ ] `npm run db:test` shows successful connection
- [ ] `npm run db:setup` completed successfully
- [ ] Server shows "Database connected successfully" on startup

## Next Steps

Once connected, you can:
1. Start using the database in your controllers
2. Migrate data from the in-memory dataStore
3. Implement proper database models

## Need Help?

Run the test script for detailed error messages:
```bash
npm run db:test
```

This will show specific error codes and troubleshooting tips.

