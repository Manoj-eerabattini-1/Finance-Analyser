# Currency Consistency Testing & Debugging Guide

This guide will help diagnose why the currency isn't updating consistently across all pages.

## What Has Been Fixed

✅ **ReportsPage** - Now uses `useCurrency()` hook through the app  
✅ **StatsCards** - Uses currency context  
✅ **TransactionList** - Uses currency context  
✅ **GoalComponents** - Uses currency context  
✅ **FinanceCharts** - Uses currency context  
✅ **Debug Logging Added** - Console logs to trace currency changes  

## Step-by-Step Testing

### 1. Open Browser Console
- Open your browser (Chrome/Firefox)
- Press **F12** to open Developer Tools
- Go to the **Console** tab
- Keep this visible while testing

### 2. Start the App & Log In
- Start your frontend: `npm run dev`
- Start your backend on port 5000
- Log in with your credentials

### 3. Test Currency Change on Dashboard
1. **Look at Dashboard** - Note all amounts displayed (should be in INR by default)
2. **Open Console** - Look for logs like:
   ```
   💾 Currency loaded from localStorage: INR
   🔄 Fetching currency from backend...
   ✅ Currency fetched from backend: INR
   📊 StatsCards rendered with currency: INR
   ```
3. **Click Currency Selector** in top-right header
4. **Select "USD"** 
5. **Watch Console** - You should see:
   ```
   🔄 Currency changing from INR to USD
   ✅ Currency updated in state: USD
   ✅ Currency saved to backend
   📊 StatsCards rendered with currency: USD
   ```
6. **Check Dashboard** - All amounts should now show in **dollars ($)**
7. **Result**: Dashboard ✅ or ❌?

### 4. Test Currency Persistence on Navigation
1. **Still on Dashboard** with currency set to **USD**
2. **Click "Goals"** in navigation
3. **Watch Console** - You should see:
   ```
   🎯 GoalCard rendered with currency: USD
   ```
4. **Check Goals Page** - Are amounts showing in **dollars ($)**? 
   - Yes: ✅  
   - No: ❌ 
5. **Click "Reports"** in navigation
6. **Watch Console** - You should see:
   ```
   📋 ReportsPage rendered with currency: USD
   ```
7. **Check Reports Page** - Are amounts showing in **dollars ($)**?
   - Yes: ✅
   - No: ❌
8. **Click "Dashboard"** in navigation
9. **Check Dashboard** - Still showing **dollars ($)**?
   - Yes: ✅
   - No: ❌

### 5. Test Change to INR from Different Page
1. **While on ReportsPage** with USD selected
2. **Click Currency Selector** → select **INR**
3. **Watch Console**:
   ```
   🔄 Currency changing from USD to INR
   ✅ Currency updated in state: INR
   ✅ Currency saved to backend
   📋 ReportsPage rendered with currency: INR
   ```
4. **Check ReportsPage** - Are amounts now showing in **rupees (₹)**?
5. **Navigate to Dashboard** - Are amounts showing in **rupees (₹)**?
6. **Navigate to Goals** - Are amounts showing in **rupees (₹)**?

### 6. Test Page Refresh
1. **Set currency to USD**
2. **Refresh page** - Press **F5**
3. **Watch Console** - Should show:
   ```
   💾 Currency loaded from localStorage: USD
   🔄 Fetching currency from backend...
   ✅ Currency fetched from backend: USD
   ```
4. **Check all displayed amounts** - Should still be in **USD ($)**

### 7. Test Logout & Login
1. **Log out** - Click logout button
2. **Set currency to USD** and log out
3. **Log in again**
4. **Watch Console during login**
5. **Check Dashboard** - Are amounts in **USD ($)**?
   - Should be because currency was saved to backend

## Expected Console Output Pattern

When you change currency from INR to USD, console should show (in order):

```
🔄 Currency changing from INR to USD
✅ Currency updated in state: USD
✅ Currency saved to backend
📊 StatsCards rendered with currency: USD
```

Then when you navigate:

```
📋 ReportsPage rendered with currency: USD
```

Or:

```
🎯 GoalCard rendered with currency: USD
```

## Possible Issues & Solutions

### Issue #1: Some pages show dollars, others show rupees
**Symptom**: Dashboard updates but Goals page doesn't  
**Causes**:
- Component not using `useCurrency()` hook
- Component not re-rendering when currency changes
- Page cached/stale data

**Debug**: Check if console shows the component name with correct currency  
**Example**: If GoalCard doesn't show in console, hook might not be called

### Issue #2: Console doesn't show component logs
**Symptom**: No "📊 StatsCards rendered" or "📋 ReportsPage rendered" logs  
**Causes**:
- Console filters applied
- Component not being rendered
- Log statements not in the render path

**Debug**: Clear console filters, check Component tab in DevTools

### Issue #3: Logs show wrong currency after change
**Symptom**: Console shows "Currency changed to USD" but component logs show "rendered with currency: INR"  
**Causes**:
- State wasn't actually updated
- Component using stale closure
- React Hook rules violated

**Debug**: Check if setCurrencyState is being called properly

### Issue #4: Currency changes but amounts don't update
**Symptom**: Currency selector changes, logs are correct, but numbers unchanged  
**Causes**:
- formatCurrency function not called with currency parameter
- Component not re-rendering
- Display logic error

**Debug**: Check what currency is being passed to formatCurrency

### Issue #5: Backend API error when saving currency
**Symptom**: Console shows "Failed to update currency on server"  
**Causes**:
- Backend not running
- API endpoint not working
- Invalid token

**Debug**:
```javascript
// Run in console to test backend:
fetch('http://localhost:5000/api/auth/currency', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer YOUR_TOKEN_HERE`
  },
  body: JSON.stringify({ currency: 'USD' })
}).then(r => r.json()).then(d => console.log(d))
```

## Manual Testing Checklist

After checking console logs, manually verify:

- [ ] Dashboard StatsCards show correct currency formatting
- [ ] Dashboard TransactionList shows correct currency  
- [ ] Dashboard Charts show correct currency symbols
- [ ] Goals Page cards show correct currency
- [ ] Reports Page summary shows correct currency
- [ ] Reports Page saved reports show correct currency
- [ ] Currency persists after page refresh
- [ ] Currency persists after logout/login
- [ ] Changing on one page updates on another page immediately

## How to Share Debugging Info

If currency is still inconsistent, share:

1. **Screenshot of Console Output** when you change currency
2. **Which page(s) don't update** - Dashboard / Goals / Reports
3. **What appears instead** - Still shows $ or still shows ₹
4. **Any error messages** in the console
5. **Backend logs** - Check if API is being called

## Quick Commands to Run in Console

```javascript
// Check localStorage
localStorage.getItem('userCurrency')

// Check what CurrencyContext thinks currency is
// (This won't work directly, but logs should show it)

// Check if CurrencySelector button visible
document.querySelector('[class*="gradient"]')?.textContent
```

## Summary

With the debug logging now in place:
1. You can see **exactly** when currency changes
2. You can see **exactly** which components re-render
3. You can see **exactly** what currency each component receives
4. You can identify **exactly** where the problem is

Once you run through these tests and share the console output, we can pinpoint the exact issue!
