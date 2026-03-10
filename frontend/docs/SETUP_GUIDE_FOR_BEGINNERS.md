# Complete Setup Guide for My Money Mentor - For Beginners

This guide will walk you through setting up the entire project from scratch, including MongoDB and Gemini API integration.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Directory Structure](#directory-structure)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [MongoDB Setup](#mongodb-setup)
6. [Gemini API Setup](#gemini-api-setup)
7. [Running the Project](#running-the-project)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, make sure you have these installed on your computer:

### 1. **Node.js and npm**
- Download from: https://nodejs.org/
- Choose the **LTS (Long Term Support)** version
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. **MongoDB**
- **Option A:** Use MongoDB Atlas (Cloud) - Recommended if you already have an account
- **Option B:** Download MongoDB Community from https://www.mongodb.com/try/download/community
- We'll configure it in the next steps

### 3. **Git** (Optional but recommended)
- Download from: https://git-scm.com/
- Helps with version control

### 4. **Visual Studio Code** (Recommended)
- Download from: https://code.visualstudio.com/

---

## Project Overview

### What is "My Money Mentor"?

It's a **Financial Goal Planning Application** with two main parts:

```
┌─────────────────────────────────────────────────┐
│  Frontend (What Users See)                      │
│  - React + Vite + TypeScript                    │
│  - Runs on: http://localhost:5173               │
│  - Shows dashboards, goals, reports             │
└──────────────────┬──────────────────────────────┘
                   │
                   │ API Calls
                   ▼
┌─────────────────────────────────────────────────┐
│  Backend (Server/Logic)                         │
│  - Node.js + Express + TypeScript               │
│  - Runs on: http://localhost:5000               │
│  - Handles data, LLM, calculations              │
└──────────────────┬──────────────────────────────┘
                   │
                   │ Reads/Writes
                   ▼
┌─────────────────────────────────────────────────┐
│  Database (Data Storage)                        │
│  - MongoDB                                      │
│  - Stores users, goals, transactions            │
└─────────────────────────────────────────────────┘
```

### Key Features
- ✅ User authentication (login/signup)
- ✅ Track income & expenses
- ✅ Create financial goals
- ✅ **AI-powered goal suggestions** (using Gemini API)
- ✅ Multi-currency support (INR/USD)
- ✅ Financial reports & analytics

---

## Directory Structure

```
my-money-mentor/
├── backend/                          # Node.js/Express server
│   ├── src/
│   │   ├── config/                  # Configuration (database, etc)
│   │   ├── controllers/             # Business logic
│   │   ├── models/                  # Database schemas
│   │   ├── routes/                  # API endpoints
│   │   ├── services/                # LLM, calculations, etc
│   │   ├── middleware/              # Auth, errors
│   │   ├── validators/              # Input validation
│   │   └── index.ts                 # Main server file
│   ├── .env                         # Environment variables (CREATE THIS!)
│   ├── .env.example                 # Template for .env
│   └── package.json                 # Dependencies
│
├── src/                              # React frontend
│   ├── components/                  # React components (UI)
│   ├── pages/                       # Page components
│   ├── context/                     # React Context (currency, etc)
│   ├── hooks/                       # Custom hooks
│   ├── types/                       # TypeScript types
│   └── main.tsx                     # Entry point
│
├── package.json                      # Frontend dependencies
└── README.md                         # Project info

```

---

## Step-by-Step Setup

### STEP 1: Navigate to Project Directory

Open your terminal/PowerShell and go to the project:

```bash
cd "c:\Users\reera\Desktop\Manoj files\Finance-Analyser\my-money-mentor"
```

### STEP 2: Install Frontend Dependencies

```bash
npm install
```

This installs all the React packages needed for the frontend.

**What this does:**
- Downloads all dependencies listed in `package.json`
- Creates a `node_modules` folder (don't touch this!)
- Takes 2-5 minutes

### STEP 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

This installs Node.js packages for the backend.

**What this does:**
- Installs Express, MongoDB driver, etc.
- Creates `node_modules` in the backend folder

### STEP 4: Create Backend Environment File

In the `backend` folder, create a file called `.env` (exactly this name).

**Path:** `backend/.env`

Copy this content into it:

**For Atlas Users (Recommended):**
```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:PASSWORD@cluster.mongodb.net/smart-financial-goal?retryWrites=true&w=majority
MONGODB_USER=
MONGODB_PASSWORD=

# JWT Configuration
JWT_SECRET=my-super-secret-key-change-this-in-production-12345
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# LLM API Configuration
OPENAI_API_KEY=
GEMINI_API_KEY=your_gemini_api_key_here

# Logging
LOG_LEVEL=debug
```

**For Local MongoDB Users:**
```
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Local MongoDB)
MONGODB_URI=mongodb://localhost:27017/smart-financial-goal
MONGODB_USER=
MONGODB_PASSWORD=

# JWT Configuration
JWT_SECRET=my-super-secret-key-change-this-in-production-12345
JWT_EXPIRE=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# LLM API Configuration
OPENAI_API_KEY=
GEMINI_API_KEY=your_gemini_api_key_here

# Logging
LOG_LEVEL=debug
```

**⚠️ IMPORTANT:**
- Never commit this file to GitHub (it has secrets!)
- Don't share this file with anyone
- `JWT_SECRET` - Change to something unique
- `GEMINI_API_KEY` - You'll fill this in the next section

### STEP 5: Verify Frontend Configuration

Check that the frontend can find the backend API.

**File:** `src/context/CurrencyContext.tsx` (around line 37-40)

You should see:
```typescript
const response = await fetch('http://localhost:5000/api/auth/currency', {
```

This tells the frontend: "The backend is running on `localhost:5000`"

---

## MongoDB Setup

MongoDB is the database where all your data is stored.

### ✅ RECOMMENDED: Use MongoDB Atlas (You Already Have This!)

Since you have a MongoDB Atlas cluster running, **skip local MongoDB installation** and use your Atlas connection string instead.

#### Get Your Connection String:

1. **Log in to MongoDB Atlas**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Log in with your account

2. **Get Connection String**
   - Click your cluster
   - Click "Connect" button
   - Choose "Drivers" (not "Connect with MongoDB Compass")
   - Copy the connection string
   - It looks like: `mongodb+srv://username:PASSWORD@cluster.mongodb.net/smart-financial-goal?retryWrites=true&w=majority`

3. **Update .env File**
   - Go to `backend/.env`
   - Replace `MONGODB_URI` with your connection string
   - Replace `PASSWORD` with your actual cluster password
   - Example:
     ```
     MONGODB_URI=mongodb+srv://manoj:MyPassword123@mycluster.mongodb.net/smart-financial-goal?retryWrites=true&w=majority
     ```

#### Use MongoDB Compass (You Already Have This!)

You can use MongoDB Compass to visually browse your database:

1. **Open MongoDB Compass**
2. **Create New Connection**
   - Click "New Connection"
   - Paste your connection string from Atlas
   - Click "Save & Connect"
3. **Now you can browse your data visually!**

---

### Optional: Local MongoDB (If you prefer to not use Atlas)

If you want to use local MongoDB instead:

#### Windows Users:

1. **Download MongoDB Community Edition**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows
   - Download the `.msi` file

2. **Run the Installer**
   - Double-click the downloaded `.msi` file
   - Click "Next" → "I accept" → "Next"
   - Choose: "Install MongoDB as a Service"
   - Click "Next" → "Install"
   - Wait for completion

3. **Update .env File**
   - In `backend/.env`, use:
   ```
   MONGODB_URI=mongodb://localhost:27017/smart-financial-goal
   ```

4. **Verify Installation**
   - Open PowerShell
   - Type: `mongod --version`
   - You should see a version number

#### Mac Users:

```bash
# Using Homebrew (install from brew.sh if you don't have it)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Update .env to use:
# MONGODB_URI=mongodb://localhost:27017/smart-financial-goal
```

#### Linux Users (Ubuntu):

```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb

# Update .env to use:
# MONGODB_URI=mongodb://localhost:27017/smart-financial-goal
```

### Test MongoDB Connection

When you run the backend (next section), you should see one of these messages:

**If using Atlas:**
```
MongoDB connected: mongodb+srv://cluster.mongodb.net
```

**If using Local MongoDB:**
```
MongoDB connected: localhost
```

If you see either message, MongoDB is working! ✅

If you see an error like `MongoServerSelectionError`, check:
- Your connection string is correct
- Your password is correct (no special characters without proper encoding)
- Your IP is whitelisted in Atlas (if using Atlas)
- MongoDB is running (if using local)

---

## Gemini API Setup

Gemini is Google's AI that helps interpret financial goals using natural language.

### Step 1: Get Gemini API Key

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - If you see "Create API Key", click it
   - Click "Create API key in new project"
   - Copy the generated API key

### Step 2: Add to .env File

In `backend/.env`, find this line:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace with your actual key:

```
GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Test LLM Integration

The LLM is used when you create a goal. The system will use Gemini to understand what you want and provide suggestions.

**How it works:**
1. You type: "Save ₹5,00,000 for a car in 18 months"
2. Gemini reads this and understands: You want a car, you have 18 months, target is ₹5,00,000
3. Gemini suggests: "Save ₹27,778 per month", "Consider getting insurance", etc.

---

## Running the Project

Now everything is set up! Let's start the application.

### Terminal Setup

You'll need **3 terminal windows/tabs**:
- Tab 1: MongoDB
- Tab 2: Backend
- Tab 3: Frontend

### Step 1: Start MongoDB

**Terminal 1:**

#### Windows (PowerShell):
```powershell
mongod
```

You should see:
```
[initandlisten] waiting for connections on port 27017
```

#### Mac/Linux:
```bash
brew services start mongodb-community
# Or if it's already running:
# brew services status mongodb-community
```

**✅ Keep this running in the background**

### Step 2: Start Backend Server

**Terminal 2:**

```bash
cd "c:\Users\reera\Desktop\Manoj files\Finance-Analyser\my-money-mentor\backend"
npm run dev
```

You should see:
```
Server running on port 5000
Environment: development
MongoDB connected: localhost
```

**✅ Keep this running**

### Step 3: Start Frontend Server

**Terminal 3:**

```bash
cd "c:\Users\reera\Desktop\Manoj files\Finance-Analyser\my-money-mentor"
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 4: Open in Browser

Click the link or go to: **http://localhost:5173/**

You should see the login page! 🎉

---

## Test the Application

### 1. Create an Account

- Click "Sign Up"
- Enter:
  - Name: Your name
  - Email: test@example.com
  - Password: test123456
  - Currency: USD (or INR)
- Click "Sign Up"

### 2. Add a Transaction

- Click "Dashboard"
- Click "Add Transaction" (on the right)
- Type:
  - Type: Income
  - Amount: 50000
  - Category: Salary
  - Date: Today
- Click "Add"

### 3. Create a Goal

- Click "Goals"
- Type in the input: "Save ₹5,00,000 for a car in 18 months"
- Click "Set Goal"
- Wait 5-10 seconds for AI suggestions
- You should see AI-generated suggestions! ✨

### 4. Check Reports

- Click "Reports"
- Click "Generate Report"
- See your financial summary

---

## Troubleshooting

### Problem: MongoDB won't start

**Windows:**
```
Failed to connect to localhost:27017
```

**Solution:**
1. Make sure MongoDB is installed
2. Open Task Manager
3. Look for "MongoDB Server" - if not there, start it:
   - Go to Services
   - Find "MongoDB"
   - Right-click → Start

**Mac/Linux:**
```bash
brew services restart mongodb-community
```

### Problem: Backend says "GEMINI_API_KEY not configured"

**Solution:**
1. Check your `backend/.env` file
2. Make sure the line exists: `GEMINI_API_KEY=AIzaSy...`
3. Restart the backend server (stop and run `npm run dev` again)

### Problem: Frontend can't connect to backend

**Error:** `Failed to fetch from http://localhost:5000`

**Solution:**
1. Make sure backend is running on Terminal 2
2. Check it says "Server running on port 5000"
3. Make sure `CORS_ORIGIN=http://localhost:5173` in `.env`
4. Restart both frontend and backend

### Problem: "MongoDB connection error"

**Solution:**
1. Check MongoDB is running (see Terminal 1)
2. Check `MONGODB_URI` in `.env` is correct
3. If using MongoDB Atlas cloud:
   - Check your internet connection
   - Verify the connection string from Atlas
   - Check your username/password are correct

### Problem: Long loading times for goals

**Solution:**
This is normal! Gemini API can take 5-10 seconds.

---

## What's Next?

Once you have everything running:

1. ✅ Explore the dashboard
2. ✅ Add some transactions
3. ✅ Create goals and see AI suggestions
4. ✅ Try changing currency to see it update everywhere
5. ✅ Read the codebase explanation document (CODEBASE_EXPLANATION.md)

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Backend port | 5000 |
| `NODE_ENV` | Development/Production | development |
| `MONGODB_URI` | Database connection | mongodb://localhost:27017/smart-financial-goal |
| `JWT_SECRET` | Password for tokens | my-secret-key |
| `CORS_ORIGIN` | Frontend URL | http://localhost:5173 |
| `GEMINI_API_KEY` | Google AI key | AIzaSy... |

---

## Need Help?

1. Check the error message in the terminal
2. Google the error message
3. Check MongoDB is running
4. Check all `.env` variables are set
5. Try restarting all services

Good luck! 🚀
