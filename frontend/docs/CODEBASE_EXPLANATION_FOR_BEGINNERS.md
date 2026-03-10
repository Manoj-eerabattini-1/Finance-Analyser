# Complete Codebase Explanation - For Absolute Beginners

This document explains every part of the Finance Analyzer application in simple terms. No prior programming knowledge needed!

---

## Table of Contents

1. [File Structure Explanation](#file-structure-explanation)
2. [Frontend (React) Explained](#frontend-react-explained)
3. [Backend (Node.js/Express) Explained](#backend-nodejs-express-explained)
4. [Database (MongoDB) Explained](#database-mongodb-explained)
5. [How Features Work](#how-features-work)
6. [Data Flow Examples](#data-flow-examples)

---

## Application Architecture

```
YOUR BROWSER (React Frontend)
    ↓ (HTTP requests with JSON)
YOUR SERVER (Express Backend on Port 5000)
    ↓ (Queries with MongoDB driver)
YOUR DATABASE (MongoDB)
```

When you:
- Click a button → Frontend sends request to Backend
- Backend processes logic → Reads/writes from Database
- Database returns data → Backend sends response to Frontend
- Frontend updates display → You see the result!

---

## File Structure Explanation

### Root Level Files

```
Finance-Analyser/
├── frontend/                              # React frontend (port 5173)
│   ├── package.json                       # List of dependencies
│   ├── vite.config.ts                     # Build configuration
│   ├── tsconfig.json                      # TypeScript settings
│   └── src/
│
├── backend/                               # Express backend (port 5000)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                              # API keys, DB connection
│   └── src/
│
├── DATA_ISOLATION_TESTING.md             # Testing guide for multi-user
└── [Other documentation files]
```

---

## Frontend (React) Explained

The frontend is what you **see and interact with** in your browser.

### What is React?

React is a JavaScript library that:
1. **Displays things on screen** (buttons, text, forms)
2. **Updates the screen** when data changes (without reloading)
3. **Handles user input** (clicks, typing)

Think of React like a smart page that updates itself.

### Frontend Folder Structure

```
src/
├── main.tsx                          # Starting point (Entry)
│   └── Runs cleanupOldMockData() to remove old localStorage keys
│
├── App.tsx                           # Main app component with routes
│
├── pages/                            # Full page components
│   ├── DashboardPage.tsx            # Dashboard with stats & transactions
│   ├── GoalsPage.tsx                # Financial goals page
│   └── ReportsPage.tsx              # Reports page
│
├── components/                       # Reusable UI pieces
│   ├── dashboard/
│   │   ├── StatsCards.tsx          # Shows income, expenses, balance
│   │   ├── TransactionList.tsx      # Shows all transactions
│   │   ├── FinanceCharts.tsx        # Shows charts & graphs
│   │   └── TransactionForm.tsx      # Form to add transaction
│   │
│   ├── goals/
│   │   └── GoalComponents.tsx       # Goal display & input
│   │
│   ├── auth/
│   │   └── AuthForm.tsx             # Login/Signup form
│   │
│   ├── layout/
│   │   ├── Header.tsx               # Top bar with logo & nav
│   │   └── MainLayout.tsx           # Layout wrapper
│   │
│   ├── CurrencySelector.tsx         # Currency toggle (INR/USD)
│   └── ui/                          # Basic UI elements (buttons, cards, etc)
│
├── context/                          # Shared data/state
│   └── CurrencyContext.tsx          # Currency preference (synced with backend)
│
├── hooks/                            # Custom functions & logic
│   ├── useAuth.ts                   # Login/logout logic (NOW: API-based)
│   ├── useTransactions.ts           # Get/add transactions (NOW: API-based)
│   ├── useGoals.ts                  # Get/add/delete goals (NOW: API-based)
│   └── useLocalStorage.ts           # Browser storage helper
│
├── types/                            # Data type definitions
│   └── finance.ts                   # TypeScript types for all data
│
├── utils/                            # Helper functions
│   ├── localStorageCleanup.ts       # Removes old mock data (NEW)
│   └── utils.ts                     # Other utilities
│
└── lib/
    └── utils.ts                     # Utility helpers
```

### Key Changes from Old Version

**OLD:** All data stored in localStorage (browser-wide storage)
```typescript
// OLD: All users saw same data
const [transactions, setTransactions] = useLocalStorage('finance-planner-transactions', []);
```

**NEW:** All data fetched from backend API with user authentication
```typescript
// NEW: Each user only sees their own data
const response = await fetch(`http://localhost:5000/api/transactions`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**What this means:**
- ✅ User A logs in → sees User A's transactions
- ✅ User B logs in → sees User B's transactions (NOT User A's!)
- ✅ Logout clears token → can't access private data
- ✅ localhost cleanup removes old mock data on app startup

### Key Frontend Files Explained

#### 1. **main.tsx** - The Starting Point

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { CurrencyProvider } from './context/CurrencyContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <CurrencyProvider>
    <App />
  </CurrencyProvider>,
)
```

**What does this do?**
- Finds the HTML element with id="root" in your browser
- Renders the entire app inside it
- Wraps the app with CurrencyProvider (so all components can access currency)

#### 2. **App.tsx** - The Main App

```typescript
function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthForm />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
    </Routes>
  )
}
```

**What does this do?**
- Sets up the different pages (routes)
- When user goes to `/dashboard`, shows DashboardPage
- Like a map that says "this URL shows this page"

#### 3. **DashboardPage.tsx** - Dashboard Page

```typescript
export function DashboardPage() {
  const { transactions, summary } = useTransactions();  // Get data

  return (
    <MainLayout>                           {/* Layout wrapper */}
      <StatsCards {...summary} />          {/* Show stats */}
      <IncomeExpenseChart {...summary} />  {/* Show chart */}
      <TransactionList transactions={transactions} />  {/* Show list */}
    </MainLayout>
  )
}
```

**What does this do?**
1. Gets transaction data using `useTransactions()` hook
2. Puts stats cards at the top
3. Shows a chart
4. Shows the transaction list
5. All wrapped in MainLayout (which adds header/footer)

#### 4. **Components** - Reusable UI Pieces

A component is like a LEGO brick - it does one thing well and can be reused.

Example: **StatsCards.tsx**

```typescript
interface StatsCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number;
}

export function StatsCards({ totalIncome, totalExpenses, netBalance, savingsRate }: StatsCardsProps) {
  const { currency } = useCurrency();  // Get current currency
  
  const stats = [
    { title: 'Total Income', value: formatCurrency(totalIncome, currency) },
    { title: 'Total Expenses', value: formatCurrency(totalExpenses, currency) },
    { title: 'Net Balance', value: formatCurrency(netBalance, currency) },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <p>{stat.title}</p>
          <p className="text-2xl font-bold">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}
```

**Breaking it down:**
- `interface StatsCardsProps` - Says what data this component needs
- `useCurrency()` - Gets the current currency (INR or USD)
- `formatCurrency()` - Formats numbers like $5,000 or ₹5,00,000
- `map()` - Creates a card for each stat
- Returns: 4 colored cards showing financial stats

#### 5. **Hooks** - Custom Logic with Backend Integration

A hook is a function that does something specific. **React hooks start with "use"**.

All data hooks now fetch from the backend API with user authentication.

**Example: useTransactions.ts (Backend API)**

```typescript
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's transactions from backend when component loads
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');  // Get auth token
      
      // Call backend API with Bearer token (proves who you are)
      const response = await fetch('http://localhost:5000/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      setTransactions(data.data.transactions);  // Update state
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const addTransaction = useCallback(async (transaction: Transaction) => {
    const token = localStorage.getItem('token');
    
    // Send to backend to save
    await fetch('http://localhost:5000/api/transactions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(transaction)
    });
    
    fetchTransactions();  // Reload list after adding
  }, [fetchTransactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    const token = localStorage.getItem('token');
    
    await fetch(`http://localhost:5000/api/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    fetchTransactions();  // Reload list after deleting
  }, [fetchTransactions]);

  return { 
    transactions, 
    addTransaction, 
    deleteTransaction, 
    isLoading, 
    error 
  };
}
```

**What does this do?**
1. When component loads → fetches user's transactions from backend
2. Backend verifies token → returns only **this user's** transactions
3. `addTransaction()` → uploads to backend, then reloads list
4. `deleteTransaction()` → removes from backend, then reloads list
5. Returns transactions, methods, and loading state

**Why Bearer Token?**
```
GET /api/transactions
Authorization: Bearer {token_here}
                       ↓
Backend says: "Who are you?"
You show token: "I'm user 123"
Backend: "OK, here are YOUR transactions"
```

**Similarly for useGoals.ts and useAuth.ts**
- `useGoals.ts` → Fetches/adds/deletes goals from `/api/goals`
- `useAuth.ts` → Handles login/register via `/api/auth`, stores token

#### 6. **Context** - Shared Data Across App

Context lets you share data across all components without passing it down like a chain.

**Example: CurrencyContext.tsx**

```typescript
const CurrencyContext = createContext<CurrencyContextType>();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState<'INR' | 'USD'>('INR');

  // Sync currency with backend
  const setCurrency = useCallback(async (newCurrency: 'INR' | 'USD') => {
    const token = localStorage.getItem('token');
    
    try {
      // Save to backend database
      await fetch('http://localhost:5000/api/auth/currency', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currency: newCurrency })
      });
      
      // Update local state
      setCurrencyState(newCurrency);
      localStorage.setItem('currency', newCurrency);
    } catch (error) {
      console.error('Failed to update currency');
    }
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Any component can use this:
export const useCurrency = () => useContext(CurrencyContext);
```

**What does this do?**
1. Creates shared currency state across all components
2. When user changes INR → USD:
   - Sends update to backend (so change persists)
   - Updates all components immediately
   - All amounts display in new currency
3. Any component can use `const { currency, setCurrency } = useCurrency()`
4. Syncs both with localStorage (browser) and backend (database)

**What does this NOT do:**
- ❌ Does NOT convert ₹5,00,000 to $6,000
- ✅ Just changes how amounts are displayed:
  - Same amount: 500000
  - INR display: ₹5,00,000
  - USD display: $500,000.00

---

## Backend (Node.js/Express) Explained

The backend is the **server** - it handles all the logic and communicates with the database.

### What is Node.js?

Node.js is JavaScript that runs on the server (not in a browser).

### What is Express?

Express is a framework that makes it easy to create a web server with Node.js.

### Backend Folder Structure

```
backend/
├── src/
│   ├── index.ts                      # Main server file
│   │
│   ├── config/
│   │   └── database.ts              # MongoDB connection setup
│   │
│   ├── models/                       # Database schemas (how data looks)
│   │   ├── User.ts                  # User: name, email, password, currency
│   │   ├── Transaction.ts           # Transaction: userId, amount, type, date
│   │   └── Goal.ts                  # Goal: userId, targetAmount, deadline
│   │
│   ├── routes/                       # API endpoints (URLs)
│   │   ├── authRoutes.ts            # /api/auth/*
│   │   ├── transactionRoutes.ts     # /api/transactions/*
│   │   └── goalRoutes.ts            # /api/goals/*
│   │
│   ├── controllers/                  # Business logic (what each endpoint does)
│   │   ├── authController.ts        # register, login, getCurrency, setCurrency
│   │   ├── transactionController.ts # get, add, delete transactions
│   │   └── goalController.ts        # get, add, update, delete goals
│   │
│   ├── middleware/                   # Pre-processing (auth check, error handling)
│   │   ├── authMiddleware.ts        # Check if user is logged in
│   │   ├── errorHandler.ts          # Catch and handle errors
│   │   └── validateRequest.ts       # Check request data is valid
│   │
│   ├── validators/                   # Input validation rules
│   │   ├── authValidator.ts         # Check email format, password length, etc
│   │   ├── goalValidator.ts
│   │   └── transactionValidator.ts
│   │
│   ├── services/                     # Complex operations
│   │   └── llmService.ts            # Google Gemini AI integration
│   │
│   └── utils/                        # Helper functions
│       ├── currencyFormatter.ts     # Format amounts (₹ vs $)
│       ├── financialCalculator.ts   # Calculate income, expenses, etc
│       ├── auth.ts                  # Password hashing, JWT tokens
│       ├── apiResponse.ts           # Standard response format
│       ├── constants.ts             # Shared constants
│       └── helpers.ts               # Other helpers
│
├── package.json
├── tsconfig.json
├── .env                              # Database URI, API keys, JWT secret
└── [Optional: deployment files]
```

**Key Change:**
- ✅ All endpoints now require Bearer token authentication
- ✅ Backend filters all responses by userId (privacy!)
- ✅ Middleware verifies token before controller runs

### Key Backend Files Explained

#### 1. **index.ts** - The Server

```typescript
import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));  // Allow frontend to call us
app.use(express.json());  // Parse JSON from requests

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);           // All auth endpoints here
app.use("/api/transactions", transactionRoutes);
app.use("/api/goals", goalRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**What does this do?**
1. Creates an Express app
2. Sets up middleware (CORS, JSON parsing)
3. Connects to MongoDB
4. Registers all routes
5. Starts listening on port 5000

#### 2. **Models** - Database Schema

A model defines what data looks like in the database.

Example: **User.ts**

```typescript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true  // No two users can have same email
  },
  password: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    enum: ['INR', 'USD'],
    default: 'INR'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);
export default User;
```

**What does this do?**
- Defines what a User looks like
- Every user **must** have: name, email, password
- Email **must be unique** (no duplicates)
- Currency can only be 'INR' or 'USD'
- MongoDB now knows how to store users

#### 3. **Routes** - API Endpoints

Routes define what endpoints are available. Each route is a URL the frontend can call.

**Example: authRoutes.ts**

```typescript
import express from "express";
import { register, login, getProfile, getCurrency, setCurrency } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);        // POST  /api/auth/register - public
router.post("/login", login);              // POST  /api/auth/login    - public
router.get("/profile", authMiddleware, getProfile);    // GET /api/auth/profile - needs token
router.get("/currency", authMiddleware, getCurrency);  // GET /api/auth/currency - needs token
router.put("/currency", authMiddleware, setCurrency);  // PUT /api/auth/currency - needs token

export default router;
```

**What does this do?**
- Defines API endpoints frontend can call
- `authMiddleware` means: "Check token before running this"
- Public routes: register, login (no token needed)
- Protected routes: profile, currency (token required)

**Example flow:**
```
Frontend: POST to /api/auth/register
    ↓
Backend: No middleware, so go straight to register()
    ↓
register() creates user, returns token

Frontend: GET /api/auth/profile with Bearer token
    ↓
Backend: authMiddleware checks token first
    ↓
authMiddleware says "Token valid, userId=123"
    ↓
getProfile() receives request, returns user 123 data
```

#### 4. **Controllers** - Business Logic with User Isolation

Controllers handle the logic for each endpoint. **All controllers now filter by userId** so users only see their own data.

**Example: transactionController.ts**

```typescript
import Transaction from "../models/Transaction.js";

// Get all transactions for logged-in user
export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.userId;  // From authMiddleware (verified token)

    // ONLY get this user's transactions!
    const transactions = await Transaction.find({ userId });

    res.json({
      success: true,
      message: "Transactions retrieved",
      data: { transactions }
    });
  } catch (error) {
    next(error);
  }
};

// Add transaction for logged-in user
export const addTransaction = async (req, res, next) => {
  try {
    const userId = req.userId;  // From authMiddleware
    const { type, amount, category, date } = req.body;

    // Validate input
    if (!type || !amount || amount <= 0) {
      throw new ApiError(400, "Invalid transaction data");
    }

    // Create transaction LINKED to this user
    const transaction = new Transaction({
      userId,      // Important: tie this to the user
      type,
      amount,
      category,
      date
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction added",
      data: { transaction }
    });
  } catch (error) {
    next(error);
  }
};

// Delete transaction (only if it belongs to user)
export const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // Find transaction AND verify it belongs to this user
    const transaction = await Transaction.findOne({ _id: id, userId });
    
    if (!transaction) {
      throw new ApiError(404, "Transaction not found");  // Or: "Access denied"
    }

    await Transaction.deleteOne({ _id: id });

    res.json({
      success: true,
      message: "Transaction deleted"
    });
  } catch (error) {
    next(error);
  }
};
```

**What does this do?**
1. `req.userId` comes from authMiddleware (who is logged in)
2. `Transaction.find({ userId })` - only get THIS user's transactions
3. When adding: tie transaction to userId (line: `userId,`)
4. When deleting: verify transaction belongs to user before deleting
5. Results: User A can't see User B's transactions!

**Security Example:**
```
User A (ID 123) has token 'token_123'
User B (ID 456) has token 'token_456'

User A calls: GET /api/transactions
    ↓
authMiddleware checks token → userId = 123
    ↓
getTransactions({userId: 123})
    ↓
Only returns transactions where userId = 123
    ↓
User A doesn't see User B's transactions! ✓

If User A tries to delete User B's transaction:
    ↓
DELETE /api/transactions/{B's_transaction_id}
    ↓
authMiddleware says userId = 123
    ↓
deleteTransaction checks: does this transaction have userId=123?
    ↓
No! It has userId=456
    ↓
Returns error: "Transaction not found" (Access denied)
    ↓
User A can't delete User B's data! ✓
```

#### 5. **Middleware** - Pre-processing with Authentication

Middleware runs BEFORE the controller. It's like a security checkpoint.

**Example: authMiddleware.ts**

```typescript
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    // Get "Authorization" header from request
    // Frontend sends: Authorization: Bearer eyJhbGc...
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    // Extract token: remove "Bearer " to get just the token part
    const token = authHeader.substring(7);  

    // Verify token is valid (not expired, not forged)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user ID to request so controller can use it
    req.userId = decoded.userId;  

    // Continue to controller
    next();  
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};
```

**What does this do?**
1. Gets token from `Authorization: Bearer {token}` header
2. Verifies token is real (JWT is valid)
3. Extracts userId from token
4. Attaches userId to request: `req.userId = 123`
5. Calls `next()` to continue to actual controller
6. If anything fails → returns 401 error

**How it protects:**

```
Hacker tries to call: GET /api/transactions
WITHOUT a valid token
    ↓
authMiddleware: "No token!"
    ↓
Returns: { success: false, message: "No token provided" }
    ↓
Hacker gets rejected ✓

Legit user calls: GET /api/transactions
WITH valid token from login
    ↓
authMiddleware: "Token verified!"
    ↓
Sets req.userId = 123
    ↓
Controller gets request with userId already set
    ↓
Controller queries: Transaction.find({userId: 123})
    ↓
User 123 gets their transactions ✓
```

**Example Error Handler Middleware:**

```typescript
// Catches all errors from controllers
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error",
    errors: err.errors || []
  });
};
```

---

## Database (MongoDB) Explained

MongoDB is a **NoSQL database** - it stores data as JSON-like documents.

### Traditional Database vs MongoDB

**Traditional (SQL):**
```
Table: Users
┌─────┬───────────┬──────────┐
│ id  │ name      │ email    │
├─────┼───────────┼──────────┤
│ 1   │ John      │ j@ex.com │
│ 2   │ Jane      │ ja@ex.co │
└─────┴───────────┴──────────┘
```

**MongoDB:**
```
Collection: users
{
  _id: ObjectId("123..."),
  name: "John",
  email: "j@ex.com",
  currency: "INR",
  createdAt: ISODate("2024-01-01"),
  settings: {
    theme: "dark",
    notifications: true
  }
}
```

### Collections in My Money Mentor

```
my-money-mentor-db/
├── users                    # All user data
│   └── { _id, name, email, password, currency }
│
├── transactions            # Income/expense records
│   └── { _id, userId, type, amount, category, date }
│
├── goals                   # Financial goals
│   └── { _id, userId, description, targetAmount, deadline }
└── reports                 # Generated reports
    └── { _id, userId, title, insights, createdAt }
```

### How It Works

**Writing Data (Saving):**
```
Frontend                Backend                  Database
┌─────┐             ┌───────┐             ┌──────────┐
│POST │─request─>  │Add to │─write─>    │Save to  │
│goal │             │goal  │            │collection
└─────┘             └───────┘            └──────────┘
```

**Reading Data (Getting):**
```
Frontend                Backend                  Database
┌─────┐             ┌───────┐             ┌──────────┐
│GET  │<─response─ │Send   │<─query─    │Return   │
│list │            │data   │            │matching │
└─────┘            └───────┘            └──────────┘
```

---

## How Features Work

### Feature 1: User Registration & Authentication

```
User fills signup form and clicks "Sign Up"
    ↓
Frontend sends: POST /api/auth/register
{
  "name": "John",
  "email": "john@example.com",
  "password": "secure123",
  "currency": "USD"
}
    ↓
Backend authController.register():
  1. Check if john@example.com already exists
  2. Hash password with bcryptjs: "secure123" → "abc123xyz..."
  3. Save user to MongoDB
  4. Create JWT token: "eyJhbGciOiJIUzI1NiIs..."
  5. Return token & user info
    ↓
Frontend stores token in localStorage['token']
    ↓
Frontend redirects to Dashboard
    ↓
User can now make authenticated requests!
```

**What's JWT?**
A JWT token is like a signed ticket:
- Frontend: "Here's my ticket to prove I'm John"
- Backend: "Shows token: eyJhbGci..."
- Backend: "Verifies signature... ✓ This is really John!"
- Backend: "OK John, here's your data"

### Feature 2: Data Isolation - Each User Only Sees Their Data

```
User A (John) logs in with token: eyJhbGc_A
    ↓
Clicks "Show Transactions"
    ↓
Frontend calls: GET /api/transactions
Headers: { Authorization: "Bearer eyJhbGc_A" }
    ↓
Backend authMiddleware:
  1. Checks token
  2. Verifies token
  3. Extracts: userId = "user_123_john"
  4. Sets: req.userId = "user_123_john"
  5. Continues to controller
    ↓
Backend transactionController.getTransactions({userId: user_123_john}):
  1. Queries: Transaction.find({ userId: "user_123_john" })
  2. Returns ONLY John's transactions
    ↓
Frontend displays John's transactions ✓

---

User B (Jane) logs in with token: eyJhbGc_B
    ↓
Clicks "Show Transactions"
    ↓
Frontend calls: GET /api/transactions
Headers: { Authorization: "Bearer eyJhbGc_B" }
    ↓
Backend authMiddleware extracts: userId = "user_456_jane"
    ↓
Backend transactionController:
  1. Queries: Transaction.find({ userId: "user_456_jane" })
  2. Returns ONLY Jane's transactions
    ↓
Frontend displays Jane's transactions ✓
Jane does NOT see John's transactions! ✓
```

### Feature 3: Multi-Currency Display

```
Same database value: 500000

User A selected Currency: USD
    ↓
formatCurrency(500000, 'USD') = "$500,000.00"

User B selected Currency: INR
    ↓
formatCurrency(500000, 'INR') = "₹5,00,000"

Same data, different display based on user preference!
```

---

## Data Flow Examples

### Example 1: User A Adds a Transaction (User Isolation)

```
┌─────────────────────────────────────────────────────┐
│ FRONTEND (React)                                    │
├─────────────────────────────────────────────────────┤
│ User A (John) adds income:                          │
│   Type: Income                                      │
│   Amount: ₹50,000                                   │
│   Category: Salary                                  │
│   Date: 2026-03-10                                  │
│                                                     │
│ useTransactions hook sends:                         │
│   POST /api/transactions                            │
│   Headers: {                                        │
│     Authorization: "Bearer eyJhbGc_JOHN_TOKEN"     │
│   }                                                 │
│   Body: {                                           │
│     type: "income",                                 │
│     amount: 50000,                                  │
│     category: "Salary",                             │
│     date: "2026-03-10"                              │
│   }                                                 │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ BACKEND (Express)                                   │
├─────────────────────────────────────────────────────┤
│ Route: POST /api/transactions                      │
│   Middleware: authMiddleware                        │
│   1. Gets token from header                         │
│   2. Verifies token                                 │
│   3. Extracts userId: "user123_john"               │
│   4. Sets req.userId = "user123_john"              │
│   5. Calls next()                                   │
│                                                     │
│ Controller: transactionController.addTransaction   │
│   1. Gets userId from req: "user123_john"          │
│   2. Validates input                                │
│   3. Creates transaction with:                      │
│      {                                              │
│        userId: "user123_john",                      │
│        type: "income",                              │
│        amount: 50000,                               │
│        category: "Salary",                          │
│        date: "2026-03-10"                          │
│      }                                              │
│   4. Saves to MongoDB                               │
│   5. Returns transaction with _id                   │
│                                                     │
│ Response:                                           │
│   {                                                 │
│     success: true,                                  │
│     message: "Transaction added",                   │
│     data: {                                         │
│       _id: "trans001",                              │
│       userId: "user123_john",                       │
│       type: "income",                               │
│       amount: 50000,                                │
│       category: "Salary",                           │
│       date: "2026-03-10",                          │
│       createdAt: "2026-03-10T10:30:00Z"           │
│     }                                               │
│   }                                                 │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ DATABASE (MongoDB)                                  │
├─────────────────────────────────────────────────────┤
│ Collection: transactions                            │
│                                                     │
│ INSERT:                                             │
│ {                                                  │
│   _id: ObjectId("trans001"),                       │
│   userId: ObjectId("user123_john"),                │
│   type: "income",                                  │
│   amount: 50000,                                   │
│   category: "Salary",                              │
│   date: ISODate("2026-03-10"),                    │
│   createdAt: ISODate("2026-03-10T10:30:00Z")     │
│ }                                                  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│ FRONTEND (React Update)                             │
├─────────────────────────────────────────────────────┤
│ useTransactions receives response                   │
│   1. Maps _id to id                                 │
│   2. Updates state:                                 │
│      setTransactions([...prev, newTransaction])    │
│   3. React re-renders StatsCards                    │
│      - totalIncome: 50000 ✓ Updated                │
│   4. React re-renders TransactionList               │
│      - New item appears ✓                          │
│   5. User sees: "₹50,000 - Salary - Income"       │
│                                                     │
│ Meanwhile User B (Jane) logs in:                    │
│   1. Sees her own transactions                      │
│   2. Does NOT see "₹50,000 - Salary" from John     │
│   3. Even though it's in same database! ✓          │
│   (because John's transaction has userId=123,      │
│    Jane's token proves she is userId=456)          │
└─────────────────────────────────────────────────────┘
```

### Example 2: Switching Currency Preference

```
User clicks: Currency Selector → USD

CurrencyContext.setCurrency('USD')
  ↓
Sends PUT /api/auth/currency
Headers: { Authorization: "Bearer {token}" }
Body: { currency: "USD" }
  ↓
Backend updates User document:
  { _id: user123, currency: "USD" }  (saved in MongoDB)
  ↓
Frontend updates state:
  currency = 'USD'
  ↓
CurrencyProvider re-renders all children
  ↓
Every component sees: currency = 'USD'
  ↓
StatsCards component:
  formatCurrency(500000, 'USD') = "$500,000.00"
  
TransactionList component:
  formatCurrency(50000, 'USD') = "$50,000.00"
  
GoalCard component:
  formatCurrency(500000, 'USD') = "$500,000.00"
  ↓
Entire dashboard now displays in USD!

User B (still on INR):
  formatCurrency(500000, 'INR') = "₹5,00,000"
  
Both users see same amounts in their own currency!
```

---

## Summary

### How Everything Connects

```
REACT (Frontend)
    ↓ (HTTP request with Bearer token)
EXPRESS (Backend)
    ↓ (Verify token, extract userId)
MIDDLEWARE (Check authorization)
    ↓ (User ID is now known)
CONTROLLER (Business logic)
    ↓ (Query: only show userId's data)
MONGODB (Database)
    ↓ (Return data for that userId only)
CONTROLLER (Prepare response)
    ↓ (Send JSON response)
EXPRESS (Backend)
    ↓ (HTTP response)
REACT (Frontend displays result)
    ↓
USER SEES THEIR DATA ONLY! ✓
```

### Key Concepts

| Concept | Purpose | Example |
|---------|---------|---------|
| **JWT Token** | Proves you're logged in | `Bearer eyJhbGciOiJIUzI1NiIs...` |
| **Bearer Token** | Attached to every request | `Authorization: Bearer {token}` |
| **userId** | Identifies each user | Extracted from token by middleware |
| **Data Isolation** | Users only see their own data | `Transaction.find({userId})` |
| **Middleware** | Pre-processing (auth check) | `authMiddleware` verifies token |
| **Controller** | Handles business logic | `transactionController.addTransaction` |
| **API Response** | Standard format | `{ success: true, data: {...} }` |
| **MongoDB Filter** | Queries only user's data | `.find({ userId: "user123" })` |
| **CurrencyContext** | Shared currency state | All components use same currency |

### Security Overview

**The system protects data through:**

1. **Authentication**: User logs in → gets unique JWT token
2. **Authorization**: Every request checks token (middleware)
3. **User Verification**: Token proves identity → extract userId
4. **Data Filtering**: Controllers filter all queries by userId
5. **Access Control**: Can't delete/modify another user's data

**Example Protection:**
```
User A (userId=123) tries to delete User B's transaction (userId=456)

Request: DELETE /api/transactions/trans999
Header: Authorization: Bearer {tokenA}
    ↓
Middleware: Verifies token → userId = 123
    ↓
Controller: Find trans999, check if userId=123
    ↓
Result: userId is 456, not 123
    ↓
Return: "Transaction not found" (or "Access denied")
    ↓
User A cannot delete User B's data! ✓
```

---

## Next Steps

1. ✅ Read this codebase explanation
2. ✅ Look at actual code files in VS Code
3. ✅ Test multi-user by logging in as different users
4. ✅ Try adding transactions as User A, then login as User B (should NOT see A's data)
5. ✅ Check Network tab to see Bearer token in every request
6. ✅ Try modifying something small and see what happens!

**You're ready to contribute!** 🚀
