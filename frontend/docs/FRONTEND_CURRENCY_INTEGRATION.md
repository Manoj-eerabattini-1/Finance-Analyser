# Frontend Currency Integration - Step-by-Step Guide

This guide walks you through the remaining steps to fully integrate the currency system into your React frontend.

---

## Step 1: Wrap App with CurrencyProvider

**File:** `src/main.tsx`

**Current Code:**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Updated Code:**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CurrencyProvider } from './context/CurrencyContext'  // ← ADD THIS

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CurrencyProvider>                                        {/* ← ADD THIS */}
      <App />
    </CurrencyProvider>                                       {/* ← ADD THIS */}
  </React.StrictMode>,
)
```

**Why?** This makes the currency context available to all components in your app.

---

## Step 2: Add Currency Selector to Header

**File:** `src/components/layout/Header.tsx`

**Current Code (Example):**
```typescript
import React from 'react'
import { Link } from 'react-router-dom'

export const Header = () => {
  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">My Money Mentor</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/goals">Goals</Link>
            <Link to="/reports">Reports</Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
```

**Updated Code:**
```typescript
import React from 'react'
import { Link } from 'react-router-dom'
import CurrencySelector from '../CurrencySelector'  // ← ADD THIS

export const Header = () => {
  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">My Money Mentor</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/goals">Goals</Link>
            <Link to="/reports">Reports</Link>
            <CurrencySelector />                                {/* ← ADD THIS */}
          </div>
        </div>
      </nav>
    </header>
  )
}
```

**Why?** Users can now see and change their currency preference from the header.

---

## Step 3: Update Components to Display Currency

### 3A. Dashboard Page - Update StatsCards

**File:** `src/components/dashboard/StatsCards.tsx`

**Add at the top:**
```typescript
import { useCurrency } from '../../context/CurrencyContext'
```

**In your component:**
```typescript
export const StatsCards = ({ transactions }) => {
  const { currency } = useCurrency()  // ← ADD THIS
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3>Total Income</h3>
        <p className="text-2xl font-bold">
          {/* OLD: */}
          {/* ₹{totalIncome.toLocaleString('en-IN')} */}
          
          {/* NEW: */}
          {currency === 'INR' 
            ? `₹${totalIncome.toLocaleString('en-IN')}`
            : `$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
          }
        </p>
      </div>
      {/* ... rest of stats ... */}
    </div>
  )
}
```

### 3B. Transaction List - Show With Currency

**File:** `src/components/dashboard/TransactionList.tsx`

**Add at the top:**
```typescript
import { useCurrency } from '../../context/CurrencyContext'
```

**In your component:**
```typescript
export const TransactionList = ({ transactions }) => {
  const { currency } = useCurrency()  // ← ADD THIS
  
  return (
    <div className="space-y-2">
      {transactions.map(transaction => (
        <div key={transaction.id} className="flex justify-between p-2 border-b">
          <span>{transaction.description}</span>
          <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
            {/* Format with user's currency */}
            {currency === 'INR'
              ? `₹${transaction.amount.toLocaleString('en-IN')}`
              : `$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            }
          </span>
        </div>
      ))}
    </div>
  )
}
```

### 3C. Goals Page - Display Goal Amounts

**File:** `src/components/goals/GoalComponents.tsx`

**Add at the top:**
```typescript
import { useCurrency } from '../../context/CurrencyContext'
```

**In your component:**
```typescript
export const GoalCard = ({ goal }) => {
  const { currency } = useCurrency()  // ← ADD THIS
  
  const progress = (goal.currentSavings / goal.targetAmount) * 100
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold">{goal.title}</h2>
      
      <div className="mt-4 space-y-2">
        <p>
          Current: 
          {currency === 'INR'
            ? ` ₹${goal.currentSavings.toLocaleString('en-IN')}`
            : ` $${goal.currentSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
          }
        </p>
        
        <p>
          Target: 
          {currency === 'INR'
            ? ` ₹${goal.targetAmount.toLocaleString('en-IN')}`
            : ` $${goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
          }
        </p>
      </div>
      
      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* If you have LLM suggestions */}
      {goal.llmEnhanced?.suggestions && (
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <h3 className="font-semibold">AI Suggestions:</h3>
          <ul className="list-disc list-inside mt-2">
            {goal.llmEnhanced.suggestions.map((suggestion, i) => (
              <li key={i} className="text-sm text-gray-700">{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

### 3D. Reports Page - Currency-Aware Charts

**File:** `src/components/dashboard/FinanceCharts.tsx`

**Add at the top:**
```typescript
import { useCurrency } from '../../context/CurrencyContext'
```

**In your chart tooltip/labels:**
```typescript
export const FinanceCharts = ({ data }) => {
  const { currency } = useCurrency()  // ← ADD THIS
  
  const formatAmount = (amount) => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`
    } else {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    }
  }
  
  return (
    <div>
      {/* If using a chart library, pass custom formatter */}
      {/* Example for Chart.js: */}
      <BarChart
        data={data}
        options={{
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => formatAmount(context.parsed.y)
              }
            }
          }
        }}
      />
    </div>
  )
}
```

---

## Step 4: Create a Reusable Currency Formatter Component (Optional)

If you want to avoid repeating the formatting logic, create a helper component:

**File:** `src/components/CurrencyDisplay.tsx`

```typescript
import { useCurrency } from '../context/CurrencyContext'

interface CurrencyDisplayProps {
  amount: number
  className?: string
}

export const CurrencyDisplay = ({ amount, className = '' }: CurrencyDisplayProps) => {
  const { currency } = useCurrency()
  
  const formatted = currency === 'INR'
    ? `₹${amount.toLocaleString('en-IN')}`
    : `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  
  return <span className={className}>{formatted}</span>
}
```

**Usage throughout your app:**
```typescript
import { CurrencyDisplay } from './CurrencyDisplay'

// Instead of:
{currency === 'INR' ? ... : ...}

// Just use:
<CurrencyDisplay amount={500000} className="text-2xl font-bold" />
```

---

## Step 5: Test the Complete Flow

### Test 1: Register New User with Currency

1. Open browser to `http://localhost:5173`
2. Click "Sign Up" or "Register"
3. Fill form with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - **Currency: USD** (select from dropdown if available, or register first and change later)
4. Submit

**Expected:** User created, logged in with USD preference

### Test 2: Change Currency

1. Look at header - should show CurrencySelector component
2. Click on currency selector (should show "$ USD" or "₹ INR")
3. Click to open dropdown
4. Select the other currency
5. Wait for loading indicator to disappear

**Expected:** All amounts on page change to new currency

### Test 3: Refresh Page

1. After changing currency, refresh the page (F5 or Ctrl+R)
2. Check if currency selector still shows selected currency

**Expected:** Currency persists from localStorage

### Test 4: Create Goal and See Currency in Suggestions

1. Go to Goals page
2. Create a new goal: "Save for vacation - $10000 - 2026"
3. Click create
4. Wait for LLM to process

**Expected:** Goal suggestions mention $ and US currency amounts

### Test 5: Switch to INR and Create Another Goal

1. Change currency back to ₹ INR
2. Create another goal
3. Check suggestions

**Expected:** Same goal in ₹ formatting

---

## Component Checklist

- [ ] `src/main.tsx` - Wrap with CurrencyProvider ✓
- [ ] `src/components/layout/Header.tsx` - Add CurrencySelector ✓
- [ ] `src/components/dashboard/StatsCards.tsx` - Use `useCurrency()` ✓
- [ ] `src/components/dashboard/TransactionList.tsx` - Use `useCurrency()` ✓
- [ ] `src/components/goals/GoalComponents.tsx` - Use `useCurrency()` ✓
- [ ] `src/components/dashboard/FinanceCharts.tsx` - Use `useCurrency()` ✓
- [ ] `src/pages/DashboardPage.tsx` - Verify amounts display correctly ✓
- [ ] `src/pages/GoalsPage.tsx` - Verify amounts display correctly ✓
- [ ] `src/pages/ReportsPage.tsx` - Verify amounts display correctly ✓
- [ ] (Optional) Create `src/components/CurrencyDisplay.tsx` helper ✓

---

## Common Issues & Solutions

### Issue: "useCurrency is not defined"
**Solution:** Make sure you:
1. Imported CurrencyContext: `import { useCurrency } from '../context/CurrencyContext'`
2. Wrapped the entire app with `<CurrencyProvider>` in `main.tsx`
3. The component using it is inside the CurrencyProvider tree

### Issue: Currency selector not visible
**Solution:**
1. Check that `CurrencySelector` is imported correctly
2. Verify it's placed inside the Header component
3. Check browser console for errors
4. Ensure Header component is rendered in your layout

### Issue: Amounts not updating when currency changes
**Solution:**
1. Make sure you're using `useCurrency()` hook in the component
2. Check that the component re-renders when currency changes
3. Verify the formatting logic is correct (INR vs USD)
4. Clear browser cache and localStorage

### Issue: "Cannot find module CurrencySelector"
**Solution:**
1. Verify file exists: `src/components/CurrencySelector.tsx`
2. Check the import path is correct
3. Restart your dev server

---

## What Happens Behind the Scenes

1. **User selects currency in dropdown** → CurrencySelector component handles the click
2. **API call** → `PUT /api/auth/currency` with selected currency
3. **Backend updates** → User model's currency field updated in MongoDB
4. **Frontend updates** → CurrencyContext state changes
5. **All components re-render** → Using `useCurrency()` hook get new currency value
6. **Amounts display** → Formatted according to new currency preference
7. **localStorage synced** → Browser persists preference locally
8. **Next login** → Backend returns saved currency in login response

---

## Next: Create a Goal and See It All Work Together

Once all components are updated:

1. Log in with your user account
2. Open the Goals page
3. Create a new goal: "Save ₹500000 for a vacation by 2026-12-31"
4. Watch the LLM suggestions appear **in your chosen currency**
5. Switch currency selector to USD
6. Refresh page - see all amounts in dollars
7. Create another goal - see suggestions in dollars

**That's it! Your multi-currency system is now fully functional! 🎉**

---

## Help I Need

If you need help implementing any of these steps, just ask! The currency system is already fully implemented on the backend. This guide just connects the frontend to use it.

---

**Estimated time to complete:** 30-45 minutes for all components
**Difficulty Level:** Easy (mostly copy-paste from examples above)
**Lines of code to change:** ~50-100 lines across all components
