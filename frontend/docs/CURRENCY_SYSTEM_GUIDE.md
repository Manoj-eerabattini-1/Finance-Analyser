# Currency System Implementation Guide

## Overview

Your application now supports **multi-currency functionality** with seamless integration across the entire frontend and backend. Users can choose between **Indian Rupees (₹)** and **US Dollars ($)** as their preferred currency.

---

## 🏗️ Architecture

### Backend Components

#### 1. **Currency Utility** (`src/utils/currencyFormatter.ts`)
Centralized formatting and conversion functions for currency handling.

**Key Functions:**
```typescript
formatCurrency(amount: number, currency: 'INR' | 'USD'): string
  // ₹5,00,000 or $500,000.00

formatNumber(amount: number, currency: 'INR' | 'USD'): string
  // 5,00,000 or 500,000.00

getCurrencySymbol(currency: 'INR' | 'USD'): string
  // ₹ or $

convertCurrency(amount, from, to): number
  // Convert between currencies (uses fixed rate: 1 USD = 83 INR)

parseCurrency(currencyString): number
  // Parse ₹5,00,000 → 500000
```

#### 2. **User Model** (`src/models/User.ts`)
Added `currency` field to store user's preference:
```typescript
currency: 'INR' | 'USD'  // Default: 'INR'
```

#### 3. **API Endpoints** (New in `src/routes/authRoutes.ts`)

```
GET  /api/auth/currency
  → Get user's current currency preference
  Response: { currency: 'INR' | 'USD' }

PUT  /api/auth/currency
  → Set user's currency preference
  Request: { currency: 'INR' | 'USD' }
  Response: { currency: updated }
```

#### 4. **Enhanced Services**

**LLM Service** (`src/services/llmService.ts`)
- `interpretGoal(description, currency)` - Interprets goals with currency support
- `generateFinancialSuggestions(income, expenses, goal, currency)` - Currency-aware suggestions

**Financial Calculator** (`src/utils/financialCalculator.ts`)
- `generateAlternativeScenarios(target, savings, deadline, currency)` - Currency-formatted scenarios

#### 5. **Goal Controller** (`src/controllers/goalController.ts`)
- Fetches user's currency preference from database
- Passes it to LLM functions for consistent formatting

---

## 🎨 Frontend Components

### 1. **Currency Context** (`src/context/CurrencyContext.tsx`)
Global context for managing currency state across the app.

**Usage:**
```typescript
import { useCurrency } from '../context/CurrencyContext';

// Inside your component
const { currency, setCurrency, isLoading, error } = useCurrency();

// Change currency
await setCurrency('USD');
// Current: currency = 'USD'
```

**Features:**
- Syncs with localStorage for persistence
- Fetches from backend on app load
- Automatic synchronization with server

### 2. **Currency Selector Component** (`src/components/CurrencySelector.tsx`)
Dropdown component for users to change currency preference.

**Features:**
- Visual feedback for current selection
- Loading state during API calls
- Error handling
- Click-outside detection
- Responsive design with Tailwind CSS

**Usage in Header/Navigation:**
```typescript
import CurrencySelector from './components/CurrencySelector';

export const Header = () => {
  return (
    <header className="flex justify-between items-center">
      <h1>My Money Mentor</h1>
      <CurrencySelector /> {/* Place in header/navbar */}
    </header>
  );
};
```

### 3. **Currency Formatting Hook** (`src/context/CurrencyContext.tsx`)
```typescript
import { formatWithCurrency } from '../context/CurrencyContext';

// In your component
const { currency } = useCurrency();

// Format amounts
<p>{formatWithCurrency(500000)}</p>
// Output: ₹5,00,000 (if INR) or $500,000.00 (if USD)
```

---

## 💾 Setup Instructions

### Backend Setup

1. **Currency formatter is already in place:**
   ```
   backend/src/utils/currencyFormatter.ts ✓
   ```

2. **User model updated with currency field** ✓

3. **API endpoints configured** ✓

4. **Services updated to use currency parameter** ✓

### Frontend Setup

1. **Add Currency Provider to main App:**
   ```typescript
   // src/main.tsx
   import { CurrencyProvider } from './context/CurrencyContext';

   ReactDOM.createRoot(document.getElementById('root')!).render(
     <CurrencyProvider>
       <App />
     </CurrencyProvider>
   );
   ```

2. **Add Currency Selector to Header:**
   ```typescript
   // src/components/layout/Header.tsx
   import CurrencySelector from '../CurrencySelector';

   export const Header = () => {
     return (
       <header>
         {/* ... other header content ... */}
         <CurrencySelector />
       </header>
     );
   };
   ```

3. **Use currency in components:**
   ```typescript
   import { useCurrency, formatWithCurrency } from '../context/CurrencyContext';

   export const GoalCard = ({ goal }) => {
     const { currency } = useCurrency();
     
     return (
       <div>
         <h2>{goal.title}</h2>
         <p>Target: {formatWithCurrency(goal.targetAmount)}</p>
         <p>Current: {formatWithCurrency(goal.currentSavings)}</p>
       </div>
     );
   };
   ```

---

## 📊 Usage Examples

### Example 1: Display Amounts in User's Preferred Currency

```typescript
// Before: Hardcoded rupees
<p>₹{(500000).toLocaleString('en-IN')}</p>

// After: Uses user's preference
import { useCurrency } from '../context/CurrencyContext';

export const MyComponent = () => {
  const { currency } = useCurrency();
  
  return (
    <p>
      {currency === 'INR' 
        ? `₹${(500000).toLocaleString('en-IN')}` 
        : `$${(500000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      }
    </p>
  );
};
```

### Example 2: Backend Goal Creation with Currency

```typescript
// Goal is created with user's currency preference
POST /api/goals
Headers: Authorization: Bearer <token>
Body: {
  "goalTitle": "Buy a car",
  "targetAmount": 500000,
  "deadline": "2026-12-31"
}

Response:
{
  "data": {
    "goalTitle": "Buy a car",
    "targetAmount": 500000,
    "llmEnhanced": {
      "suggestions": [
        "Budget ₹50,000 for insurance annually",
        "Include registration fees (~₹25,000)"
      ]
    }
  }
}
// Suggestions formatted in ₹ (if user has INR) or $ (if USD)
```

### Example 3: Changing Currency

```typescript
// User clicks on Currency Selector dropdown
// User selects "USD"
// Backend call:
PUT /api/auth/currency
Headers: Authorization: Bearer <token>
Body: { "currency": "USD" }

// All future LLM responses will use $
// All components using formatWithCurrency will display $
```

### Example 4: Register with Currency Preference

```typescript
// New user registration with preferred currency
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "currency": "USD"  // Optional, defaults to INR
}

Response:
{
  "data": {
    "userId": "...",
    "name": "John Doe",
    "currency": "USD",
    "token": "..."
  }
}
```

---

## 🔄 Supported Currencies

| Currency | Symbol | Code | Locale | Decimals |
|----------|--------|------|--------|----------|
| **Indian Rupee** | ₹ | INR | en-IN | 0 |
| **US Dollar** | $ | USD | en-US | 2 |

**Note:** To add more currencies, update the `CURRENCY_CONFIG` in `currencyFormatter.ts` and add cases to relevant functions.

---

## 🔐 Data Persistence

### Local Storage
- Currency preference saved in `localStorage` for immediate availability
- Persists across browser sessions

### Backend Database
- User's currency preference stored in MongoDB
- Synced when user logs in
- Updated when user changes preference through API

### Sync Flow
```
User selects currency
    ↓
Frontend updates localStorage immediately (instant UI update)
    ↓
API call to backend to persist preference
    ↓
Server returns updated currency
    ↓
All future requests use stored preference
```

---

## 📋 Checklist for Implementation

### Backend ✅
- [x] Create `currencyFormatter.ts` utility
- [x] Update User model with currency field
- [x] Add `getCurrency` endpoint
- [x] Add `setCurrency` endpoint  
- [x] Update `register` to accept currency
- [x] Update LLM service signatures
- [x] Update financial calculator
- [x] Update goal controller to fetch user currency
- [x] Pass currency to all formatting functions

### Frontend - Required Setup
- [ ] Wrap App with `<CurrencyProvider>`
- [ ] Import and place `<CurrencySelector />` in Header
- [ ] Update all hardcoded currency displays to use `useCurrency()`
- [ ] Update number formatting to use `formatWithCurrency` hook

### Frontend - Components to Update
The following components should be updated to use the currency context:

```
src/components/dashboard/
  ├── GoalCard.tsx (display goal amounts)
  ├── StatsCards.tsx (display financial stats)
  ├── FinanceCharts.tsx (label axes/legends)
  └── TransactionList.tsx (display transaction amounts)

src/components/goals/
  └── GoalComponents.tsx (display goal details)

src/pages/
  ├── DashboardPage.tsx
  ├── ReportsPage.tsx
  └── GoalsPage.tsx
```

---

## 🧪 Testing Currency Changes

### Test Scenario 1: Register with Currency

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "currency": "USD"
  }'
```

Expected: User created with USD currency

### Test Scenario 2: Change Currency

```bash
curl -X PUT http://localhost:5000/api/auth/currency \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"currency": "INR"}'
```

Expected: Currency updated to INR, response confirms change

### Test Scenario 3: Create Goal with Currency-Aware Suggestions

```bash
curl -X POST http://localhost:5000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "goalTitle": "Save for vacation",
    "targetAmount": 300000,
    "deadline": "2027-06-30"
  }'
```

Expected: Suggestions formatted in user's selected currency

---

## 🚀 Deployment Notes

1. **Exchange Rates:** Currently uses fixed rate (1 USD = 83 INR)
   - For production, integrate a real-time currency API (OpenExchangeRates, etc.)
   - Update `convertCurrency()` function in `currencyFormatter.ts`

2. **Database Migration:** Existing users will default to INR
   - New users must select currency during registration or set it in profile

3. **Backward Compatibility:**
   - All API responses include currency in profile/login endpoints
   - Frontend gracefully handles missing currency (defaults to INR)

---

## 📝 Files Modified/Created

### Backend Files
✅ `src/utils/currencyFormatter.ts` (NEW)
✅ `src/models/User.ts` (MODIFIED - added currency field)
✅ `src/controllers/authController.ts` (MODIFIED - added getCurrency, setCurrency, updated register/login)
✅ `src/routes/authRoutes.ts` (MODIFIED - added currency routes)
✅ `src/services/llmService.ts` (MODIFIED - all functions now accept currency)
✅ `src/utils/financialCalculator.ts` (MODIFIED - generateAlternativeScenarios now accepts currency)

### Frontend Files
✅ `src/context/CurrencyContext.tsx` (NEW)
✅ `src/components/CurrencySelector.tsx` (NEW)

---

## 🎯 Next Steps

1. **Wrap your App with CurrencyProvider** in `src/main.tsx`
2. **Add CurrencySelector** to your Header/Navigation component
3. **Update components** that display financial amounts to use the currency context
4. **Test** the currency switching functionality
5. **Deploy** with confidence that all amounts will display in the user's preferred currency!

---

## 💡 Pro Tips

- **Performance:** Currency context uses React Context API for optimal performance
- **Offline Mode:** LocalStorage keeps currency preference even if offline
- **Type Safety:** Full TypeScript support for currency type
- **Accessibility:** Component includes proper ARIA labels and keyboard support
- **Responsiveness:** CurrencySelector works on mobile and desktop

---

**Everything is now set up for a fully functional multi-currency experience! 🎉**

Start by adding the CurrencyProvider to your main.tsx file and placing the CurrencySelector component in your header.
