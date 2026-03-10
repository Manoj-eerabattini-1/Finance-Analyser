# Data Isolation Fix - Testing Guide

## Overview
All user data (transactions, goals, authentication) is now fetched from the backend API instead of localStorage. Each user's data is now properly isolated on the server.

## What Changed

### 1. Authentication System
**Before:** Mock local authentication with hash-based passwords  
**After:** Real backend API with JWT tokens

- Login/register now calls `http://localhost:5000/api/auth/login` and `http://localhost:5000/api/auth/register`
- JWT token stored in localStorage['token']
- User profile fetched from `http://localhost:5000/api/auth/profile`
- Authorization: All subsequent API calls include `Authorization: Bearer {token}` header

### 2. Transactions Management
**Before:** localStorage['finance-planner-transactions'] - shared across all browser instances  
**After:** Backend API at `http://localhost:5000/api/transactions`

- `GET /api/transactions` - Fetch user's transactions
- `POST /api/transactions` - Create new transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- Filter: Only transactions with matching `userId` are returned

### 3. Goals Management
**Before:** localStorage['finance-planner-goals'] - shared across all users  
**After:** Backend API at `http://localhost:5000/api/goals`

- `GET /api/goals` - Fetch user's goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal
- Filter: Only goals with matching `userId` are returned

## Testing Checklist

### Phase 1: Cleanup Verification ✅
- [ ] Open browser DevTools → Application/Storage → LocalStorage
- [ ] Check that old keys are removed:
  - [ ] `finance-planner-transactions` - SHOULD BE GONE
  - [ ] `finance-planner-goals` - SHOULD BE GONE
  - [ ] `finance-planner-users` - SHOULD BE GONE
  - [ ] `finance-planner-auth` - SHOULD BE GONE
  - [ ] `finance-planner-user` - SHOULD BE GONE
- [ ] Check that new keys exist:
  - [ ] `token` - JWT from backend
  - [ ] `user` - Current user profile JSON
  - [ ] `currency` - User's currency preference

### Phase 2: Authentication Flow 🔐
- [ ] Register new test account (Account A)
  - Verify success message
  - Verify token stored in localStorage
  - Verify user redirected to dashboard
  - Check DevTools: `localStorage['token']` and `localStorage['user']` should exist

- [ ] Logout Account A
  - Verify redirected to login page
  - Verify `localStorage['token']` is cleared
  - Verify `localStorage['user']` is cleared

- [ ] Login with Account A
  - Verify token is stored
  - Verify profile is fetched (check Network tab for GET /api/auth/profile)
  - Verify dashboard loads with Account A's data

- [ ] Register second test account (Account B)
  - Verify Account B has different token than Account A
  - Verify Account B's profile is different

### Phase 3: Data Isolation - Transactions 💰
**Most Critical Test**

1. **As Account A:**
   - [ ] Add transaction: "Salary $5000" (income)
   - Check Network tab: POST /api/transactions request should include:
     - `Authorization: Bearer {token_A}` header
     - `userId: {account_a_id}` in request/response
   - [ ] Transaction appears in dashboard
   - [ ] Add another transaction: "Groceries $50" (expense)
   - [ ] Dashboard shows: Income $5000, Expense $50, Balance $4950

2. **Switch to Account B (in different browser or incognito):**
   - [ ] Register and Login as Account B
   - [ ] Dashboard should be EMPTY
   - [ ] No '$ 4950' balance visible
   - [ ] No transactions showing

3. **Back to Account A (different browser session):**
   - [ ] Login as Account A
   - [ ] Verify original transactions still exist:
     - [ ] $5000 income
     - [ ] $50 expense
     - [ ] $4950 balance

4. **As Account B:**
   - [ ] Add different transaction: "Bonus $2000" (income)
   - [ ] Dashboard shows: Income $2000, Expenses $0, Balance $2000
   - [ ] Verify the $5000 and $50 from Account A are NOT visible

### Phase 4: Data Isolation - Goals 🎯
1. **As Account A:**
   - [ ] Click "Add Goal"
   - [ ] Enter goal: "Save $10000 by end of year"
   - Check Network tab: POST /api/goals includes `Authorization: Bearer {token_A}`
   - [ ] Goal appears in goals section
   - [ ] Add contribution to goal: "+$1000"

2. **Switch to Account B:**
   - [ ] Goals list should be EMPTY
   - [ ] No "$10000" goal visible
   - [ ] No progress showing

3. **As Account B:**
   - [ ] Add different goal: "Save $5000 for emergency fund by end of month"
   - [ ] Verify only this goal appears
   - [ ] Add contribution: "+$500"

4. **Back to Account A:**
   - [ ] Original goal still exists with $1000 progress
   - [ ] Account B's "emergency fund" goal NOT visible

### Phase 5: Currency Preference Isolation
1. **As Account A:**
   - [ ] Click currency selector → Select USD
   - Check Network tab: PUT /api/auth/currency includes `Authorization: Bearer {token_A}`
   - [ ] All amounts display in USD format: $5,000.00

2. **As Account B:**
   - [ ] Currency still shows in default (INR) or what B selected
   - [ ] Verify not affected by Account A's USD selection
   - [ ] Change to EUR or USD (if available)
   - [ ] Verify independent from Account A

### Phase 6: Error Scenarios ⚠️
1. **Invalid Token:**
   - [ ] Manually delete `localStorage['token']`
   - [ ] Refresh page
   - [ ] Should redirect to login
   - [ ] Transactions/goals hooks should handle gracefully

2. **Missing Authorization Header:**
   - Check Network tab during transaction fetch
   - [ ] Authorization header should always be present
   - [ ] Header format: `Authorization: Bearer {valid_token}`

3. **API Error Responses:**
   - [ ] Try to add transaction with invalid data
   - [ ] Check error message displays in UI
   - [ ] Transaction should not be added
   - [ ] Page should remain functional

### Phase 7: Persistence & Refresh
1. **Account A:**
   - [ ] Add transaction: "$100 movie tickets"
   - [ ] Full page refresh (Ctrl+Shift+R hard refresh)
   - [ ] Transaction should still appear
   - [ ] Profile should reload from API

2. **Close browser entirely**
   - [ ] Reopen browser
   - [ ] Account A might need to re-login (token stored)
   - [ ] After login, original transactions should appear

## Network Tab Inspection

### What to look for in DevTools → Network Tab

**Successful API Call Pattern:**
```
GET /api/transactions
Status: 200
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  Content-Type: application/json

Response:
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      { "_id": "...", "userId": "account_a_id", amount: 5000, ... }
    ]
  }
}
```

**Failed API Call Pattern:**
```
GET /api/transactions
Status: 401 Unauthorized
Response:
{
  "success": false,
  "message": "No token provided or token invalid"
}
```

## Browser Console Checks

Open DevTools → Console and look for:
1. ✅ Should see: "Fetched transactions:", "Fetched goals:"
2. ❌ Should NOT see: "Cannot read property '_id' of undefined"
3. ❌ Should NOT see: CORS errors
4. ❌ Should NOT see: "Unexpected token" in localStorage parsing

## Success Criteria

✅ **PASS** if all these are true:
- [ ] Two accounts can be logged in simultaneously (different browsers/incognito)
- [ ] Each account only sees their own transactions
- [ ] Each account only sees their own goals
- [ ] Currency preference is independent per account
- [ ] localStorage cleanup removed old mock keys
- [ ] All API calls include proper Bearer token
- [ ] Can add/delete transactions and goals
- [ ] No error messages in console
- [ ] Page refresh doesn't lose data

❌ **FAIL** if any of these happen:
- [ ] Account B can see Account A's transactions
- [ ] Account B can see Account A's goals
- [ ] localStorage still contains 'finance-planner-*' keys
- [ ] API calls show missing Authorization header
- [ ] Console shows CORS or authentication errors
- [ ] Adding/deleting transactions fails silently
- [ ] Data is lost after page refresh

## Debugging Tips

### Check Current User
In Console:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
console.log('Currency:', localStorage.getItem('currency'));
```

### Monitor API Calls
```javascript
// Open DevTools Network tab, filter by "api"
// Watch for each operation:
// - Login: POST /api/auth/login
// - Fetch: GET /api/transactions, GET /api/goals, GET /api/auth/profile
// - Add: POST /api/transactions, POST /api/goals
// - Delete: DELETE /api/transactions/id, DELETE /api/goals/id
```

### Clear All Storage (if needed)
```javascript
// If you want to start fresh from console:
localStorage.clear();
// Then reload page
```

### Verify Bearer Token Format
```javascript
const token = localStorage.getItem('token');
console.log('Token present:', !!token);
console.log('Token starts with "eyJ":', token?.startsWith('eyJ'));
```

## Expected Console Logs

When working correctly, you should see logs like:

```
[main.tsx] Clearing old localStorage key: finance-planner-transactions
[main.tsx] Clearing old localStorage key: finance-planner-goals
[main.tsx] Clearing old localStorage key: finance-planner-users
[main.tsx] Clearing old localStorage key: finance-planner-auth
[main.tsx] Clearing old localStorage key: finance-planner-user
[main.tsx] Old mock data cleaned up successfully

[useAuth.ts] Error fetching profile: ... (on first load if not logged in)
[useTransactions.ts] Fetched transactions: { ... }
[useGoals.ts] Fetched goals: { ... }
[CurrencyContext.tsx] Fetched currency: { ... }
```

## Rollback Plan (if something breaks)

If issues arise, the old code is still in git history. Don't hesify to restart testing or revert.

The key changes are in:
- `frontend/src/hooks/useTransactions.ts`
- `frontend/src/hooks/useGoals.ts`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/utils/localStorageCleanup.ts`
- `frontend/src/main.tsx`
