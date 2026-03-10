# Currency System - Testing & Verification Guide

Quick reference for testing all aspects of the currency system.

---

## 🚀 Quick Start Testing

### Prerequisites
- Backend running on http://localhost:5000
- Frontend running on http://localhost:5173
- MongoDB connected
- Have a test user account or create one

---

## Backend API Testing

Use these curl commands to test backend endpoints. Replace `YOUR_TOKEN` with actual JWT token from login.

### 1. Register New User with Currency

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Currency Test User",
    "email": "currency-test@example.com",
    "password": "test123456",
    "currency": "USD"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "userId": "xxx",
    "name": "Currency Test User",
    "email": "currency-test@example.com",
    "currency": "USD",
    "token": "eyJhbGc..."
  }
}
```

✅ **Verify:** Response includes `"currency": "USD"`

---

### 2. Get User's Currency Preference

```bash
curl -X GET http://localhost:5000/api/auth/currency \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "currency": "USD"
  }
}
```

✅ **Verify:** Returns correct currency

---

### 3. Change Currency

```bash
curl -X PUT http://localhost:5000/api/auth/currency \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"currency": "INR"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "currency": "INR"
  }
}
```

✅ **Verify:** Currency changed to INR

---

### 4. Create Goal (with Currency-Aware Suggestions)

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

**Expected Response (if currency is INR):**
```json
{
  "success": true,
  "data": {
    "goalId": "xxx",
    "goalTitle": "Save for vacation",
    "targetAmount": 300000,
    "llmEnhanced": {
      "suggestions": [
        "Save approximately ₹10,714 monthly to reach your goal",
        "Consider opening a high-yield savings account earning 4-5% annual returns",
        "Budget ₹15,000 for miscellaneous vacation expenses"
      ]
    }
  }
}
```

✅ **Verify:** Suggestions use ₹ symbols and amounts are formatted with Indian number system (5,00,000)

**If currency is USD:**
```json
{
  "success": true,
  "data": {
    "goalId": "xxx",
    "goalTitle": "Save for vacation",
    "targetAmount": 300000,
    "llmEnhanced": {
      "suggestions": [
        "Save approximately $3,614 monthly to reach your goal",
        "Consider opening a high-yield savings account earning 4-5% annual returns",
        "Budget $1,800 for miscellaneous vacation expenses"
      ]
    }
  }
}
```

✅ **Verify:** Suggestions use $ symbols and amounts are formatted with two decimals

---

### 5. Verify Currency Formatting

Create a goal with INR, note down the amounts in suggestions, then switch to USD and create another goal with the same target amount. The suggestions should reflect the currency conversion (multiply by ~83).

**INR Example:**
- Target: 300,000 (₹300,000)
- Monthly save: ₹10,714

**USD Example:**
- Target: 300,000 (which is ~$3,614.40 USD)
- Monthly save: ~$121.88

✅ **Verify:** Amounts are appropriately sized for each currency

---

## Frontend Testing

### Test 1: App Wrapping with CurrencyProvider

**Location:** `src/main.tsx`

**Check:**
```typescript
<CurrencyProvider>
  <App />
</CurrencyProvider>
```

**Verification:**
1. Open browser console (F12)
2. No errors should appear
3. App should load normally

✅ **Success:** App loads without errors

---

### Test 2: CurrencySelector Component in Header

**Location:** `src/components/layout/Header.tsx`

**Check:**
```typescript
import CurrencySelector from '../CurrencySelector'

// In JSX:
<CurrencySelector />
```

**Visual Verification:**
1. Open app in browser
2. Look at the header/navbar
3. You should see a dropdown button showing "$ USD" or "₹ INR"

✅ **Success:** Currency selector visible in header

---

### Test 3: Currency Selector Functionality

**Steps:**
1. Click the currency selector in header
2. Dropdown should open showing both options
3. Current currency should be highlighted/checked
4. Click to select different currency
5. A loading indicator briefly appears
6. All amounts on page update

**Expected Behavior:**
- INR: Amounts like ₹5,00,000 (no decimals, Indian number system)
- USD: Amounts like $500,000.00 (2 decimals, US number system)

✅ **Success:** Currency switching works, amounts update instantly

---

### Test 4: Amounts Display Correctly

**Check all pages:**

#### Dashboard Page
- [ ] StatsCards show amounts in selected currency
- [ ] Transaction list shows amounts with correct symbol
- [ ] Charts/bars labeled with correct currency

#### Goals Page
- [ ] Goal cards show target in selected currency
- [ ] Current savings shown in selected currency
- [ ] AI suggestions use selected currency amounts

#### Reports Page
- [ ] Charts labeled in selected currency
- [ ] Breakdown amounts use selected currency

**Example:**
```
BEFORE (hardcoded rupees):
  Total Income: ₹500000
  
AFTER (currency-aware):
  Total Income: ₹5,00,000 (if INR) or $500,000.00 (if USD)
```

✅ **Success:** All amounts display with correct currency

---

### Test 5: localStorage Persistence

**Steps:**
1. Change currency to USD
2. Refresh page (F5)
3. Currency selector should still show "$ USD"
4. All amounts should still be in USD

**Technical Verification:**
1. Open DevTools (F12)
2. Go to Application → localStorage
3. Look for the domain
4. Should see `currency: "USD"` or `currency: "INR"`

✅ **Success:** Currency persists across page reloads

---

### Test 6: Login/Logout Persistence

**Steps:**
1. Log in with user that has USD preference
2. Check currency selector shows USD
3. Reload page
4. Should still show USD (from backend on load)
5. Log out
6. Log in again
7. Should remember USD preference

✅ **Success:** Currency preference persists across login/logout

---

### Test 7: Multiple Users

**Steps:**
1. Create User A with INR preference
2. Create User B with USD preference
3. Log in as User A → should show INR
4. Log out, log in as User B → should show USD
5. Each user sees their own preferred currency

✅ **Success:** Each user has independent currency preference

---

## Integration Testing

### Full Flow Test: Register → Set Currency → Create Goal

**Steps:**

1. **Register with currency choice**
   ```
   Navigate to signup page
   Create account: test-final@example.com, password123
   Select currency: USD
   Submit
   ```
   ✅ Verify: Logged in with USD preference shown

2. **Add income/transactions**
   ```
   Go to Dashboard
   Add transaction: "Monthly Salary" - $3000 (income)
   Add expense: "Utilities" - $500
   ```
   ✅ Verify: Amounts show with $ symbol

3. **Create a goal**
   ```
   Go to Goals
   Create goal: "Buy a car" - Target $25000 - Deadline 2026-12-31
   ```
   ✅ Verify: Goal created, AI suggestions appear with $ amounts

4. **Switch currency**
   ```
   Click currency selector
   Change to INR
   Wait for update
   ```
   ✅ Verify: 
   - All amounts convert to ₹ (approximately $25000 = ₹20,75,000)
   - AI suggestions update (if you re-create goal)
   - Dashboard shows ₹ symbols

5. **Verify persistence**
   ```
   Refresh page
   Close and reopen browser
   Log out and log in again
   ```
   ✅ Verify: INR preference persists

6. **Test with second user**
   ```
   Log out
   Create new account with USD
   Log in
   ```
   ✅ Verify: New user sees USD, First user still has INR on their next login

---

## Error Handling Tests

### Test 1: Invalid Currency Selection

**Action:** Try to set invalid currency via API:
```bash
curl -X PUT http://localhost:5000/api/auth/currency \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"currency": "EUR"}'
```

**Expected:** Error response
```json
{
  "success": false,
  "message": "Invalid currency. Supported: INR, USD"
}
```

✅ **Verify:** Backend rejects invalid currencies

---

### Test 2: Missing Authorization Token

**Action:** Try to get currency without token:
```bash
curl -X GET http://localhost:5000/api/auth/currency
```

**Expected:** 401 Unauthorized error

✅ **Verify:** Protected endpoints require authentication

---

### Test 3: Network Error Handling

**Action:** 
1. Close backend server while app is running
2. Try to change currency in UI
3. Try to refresh page

**Expected:**
- Error message displayed in UI
- Currency reverts to previous value
- UI recovers when backend is back online

✅ **Verify:** Graceful error handling

---

## Performance Testing

### Test 1: No Unnecessary Re-renders

**Steps:**
1. Create a goal in INR
2. Switch to USD
3. Open DevTools → React DevTools
4. Check Components tab for re-renders
5. Only currency-aware components should re-render

✅ **Good Performance:** Not all components re-render, only those using useCurrency()

---

### Test 2: localStorage Performance

**Steps:**
1. Open DevTools → Performance tab
2. Start recording
3. Change currency
4. Stop recording

**Expected:** Instant UI update from localStorage before API call completes

✅ **Verify:** UI updates happen instantly from cache

---

## Checklist for Full Verification

### Backend ✅
- [ ] Register with currency parameter works
- [ ] GET /api/auth/currency returns correct currency
- [ ] PUT /api/auth/currency updates currency
- [ ] Goal creation uses correct currency in suggestions
- [ ] Multiple users have independent currency preferences
- [ ] Invalid currencies are rejected
- [ ] Protected endpoints require authentication

### Frontend ✅
- [ ] CurrencyProvider wraps entire app
- [ ] CurrencySelector visible and functional
- [ ] Currency persistence works (localStorage)
- [ ] All amounts display in selected currency
- [ ] Dashboard shows amounts in user's currency
- [ ] Goals page shows amounts in user's currency
- [ ] Reports page shows amounts in user's currency
- [ ] Switching currency updates all displays instantly
- [ ] Currency preference survives page reload
- [ ] Multiple users see their own preferences
- [ ] Error handling graceful (shows message, doesn't crash)

### Integration ✅
- [ ] Register → Currency set → Create goal → Suggestions use currency
- [ ] Logout → Login as different user → Shows their currency
- [ ] API and UI are in sync (no mismatches)
- [ ] Conversion between INR and USD is correct

---

## Quick Test Commands

**Copy-paste ready tests:**

```bash
# Test 1: Register and get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@ex.com","password":"pwd123","currency":"USD"}' \
  | jq -r '.data.token')
echo "Token: $TOKEN"

# Test 2: Get currency
curl -X GET http://localhost:5000/api/auth/currency \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 3: Change to INR
curl -X PUT http://localhost:5000/api/auth/currency \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"currency":"INR"}' | jq

# Test 4: Get currency again (should be INR)
curl -X GET http://localhost:5000/api/auth/currency \
  -H "Authorization: Bearer $TOKEN" | jq
```

---

## Troubleshooting

### Issue: "Cannot read property 'currency' of undefined"

**Cause:** CurrencyProvider not wrapping component

**Fix:** 
1. Go to `src/main.tsx`
2. Wrap `<App />` with `<CurrencyProvider>`
3. Restart dev server

---

### Issue: Currency doesn't persist after refresh

**Cause:** localStorage not being set

**Fix:**
1. Check browser console for errors
2. Verify CurrencyContext is reading/writing localStorage
3. Clear browser cache and try again

---

### Issue: API returns wrong currency in goal suggestions

**Cause:** Goal controller not fetching user's currency

**Fix:**
1. Check `goalController.ts` has: `const currency = user?.currency || 'INR'`
2. Check this currency is passed to `interpretGoal()`
3. Restart backend

---

### Issue: amounts not updating after currency change

**Cause:** Component not re-rendering when currency changes

**Fix:**
1. Make sure component uses `useCurrency()` hook
2. Component must be inside CurrencyProvider
3. Check component is reading the currency variable: `const { currency } = useCurrency()`

---

## Success Criteria

✅ **All Green?** Your currency system is complete!

When all tests pass, your application has:
- ✅ Full multi-currency support (INR/USD)
- ✅ Persistent user preference storage
- ✅ Currency-aware AI goal suggestions
- ✅ Seamless frontend-backend integration
- ✅ Proper error handling
- ✅ Type-safe currency operations

---

**Ready to deploy! 🚀**

Run these tests before pushing to production to ensure everything works smoothly for your users.
