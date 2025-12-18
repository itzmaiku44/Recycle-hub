# Recycle Hub: Waste Management and Recycling Platform

This project is for academic purpose only.
Do not use for monetization.

# Installation Guide

This guide will help you set up and run the Recycle Hub project on your local machine.

## 📋 Prerequisites

Before installing, make sure you have the following installed on your system:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation:
     ```powershell
     node --version
     npm --version
     ```

2. **PostgreSQL** (v14 or higher)
   - Download from: https://www.postgresql.org/download/
   - Or use a cloud database (e.g., Supabase, Neon, Railway)
   - Verify installation:
     ```powershell
     psql --version
     ```

3. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/downloads
   - Verify installation:
     ```powershell
     git --version
     ```

### Recommended Tools

- **VS Code** or any code editor
- **PostgreSQL GUI** (pgAdmin, DBeaver, or TablePlus) - optional but helpful

---

## 🚀 Installation Steps

### Step 1: Clone or Download the Project

**Option A: If you have Git:**
```powershell
git clone https://github.com/itzmaiku44/Recycle-hub.git
cd Recycle-hub
```

**Option B: Download ZIP:**
1. Download the project ZIP file
2. Extract it to your desired location
3. Open terminal in the project folder

### Step 2: Install Frontend Dependencies

Navigate to the project root and install dependencies:

```powershell
cd c:\Users\Michael\Proggers\Webdevors\recycle-hub\recycle-hub-repo
npm install
```

This will automatically:
- Install all frontend dependencies
- Install server dependencies (via `postinstall` script)
- Generate Prisma Client

**Note:** If you encounter errors, you may need to install server dependencies separately:

```powershell
cd server
npm install
cd ..
```

### Step 3: Set Up Environment Variables

#### Frontend Environment (Optional)

The frontend automatically detects localhost vs production. No environment variables needed for local development.

If you want to override, create `.env` in the root:
```env
VITE_API_BASE=http://localhost:4000/api
VITE_API_ORIGIN=http://localhost:4000
```

#### Backend Environment (Required)

1. Create a `.env` file in the `server/` directory:
   ```powershell
   cd server
   # Create .env file
   ```

2. Add your database connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/recycle_hub?schema=public"
   ```

   **Replace:**
   - `username` - Your PostgreSQL username (default: `postgres`)
   - `password` - Your PostgreSQL password
   - `localhost:5432` - Your database host and port
   - `recycle_hub` - Your database name

   **Example:**
   ```env
   DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/recycle_hub?schema=public"
   ```

### Step 4: Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

1. **Create a new database:**
   ```powershell
   # Open PostgreSQL command line
   psql -U postgres
   
   # Create database
   CREATE DATABASE recycle_hub;
   
   # Exit
   \q
   ```

2. **Or use pgAdmin:**
   - Open pgAdmin
   - Right-click "Databases" → "Create" → "Database"
   - Name: `recycle_hub`
   - Click "Save"

#### Option B: Cloud Database (Recommended for beginners)

Use a free cloud PostgreSQL service:

1. **Supabase** (https://supabase.com)
   - Create account → New Project
   - Copy connection string from Settings → Database
   - Use the connection string in `.env`

2. **Neon** (https://neon.tech)
   - Create account → Create Project
   - Copy connection string
   - Use in `.env`

3. **Railway** (https://railway.app)
   - Create account → New Project → PostgreSQL
   - Copy connection string
   - Use in `.env`

### Step 5: Run Database Migrations

This will create all necessary tables in your database:

```powershell
cd server
npx prisma migrate dev --name init
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Applied migration `20241218_init`
```

**Note:** If you get an error about Prisma Client, run:
```powershell
npx prisma generate
```

### Step 6: Verify Installation

Check that everything is set up correctly:

```powershell
# Verify Prisma Client is generated
cd server
npx prisma generate

# Check database connection
npx prisma db pull
```

---


---

## How to run the Project?

You need to run **two servers** simultaneously:

#### Terminal 1: Backend Server

```powershell
cd server
npm run dev
```

**Expected output:**
```
Server running on http://localhost:4000
```

#### Terminal 2: Frontend Development Server

```powershell
# From project root
npm run dev
```

**Expected output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```


## 🎯 Default Accounts

After setup, you can use these accounts:

### Admin Account
- **Email:** `hubadmin@recyclehub.com`
- **Password:** `admin123`
- **Role:** ADMIN

### User Account
- Create a new account via registration form
- Or create via Prisma Studio

---
