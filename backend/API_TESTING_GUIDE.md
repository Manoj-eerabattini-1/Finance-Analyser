# API Testing Guide

## Overview
This guide provides step-by-step instructions for testing all backend endpoints, including the new Planner and Reports features.

## Quick Start

### 1. Start the Backend Server
```bash
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
📊 Database connected
✅ All systems operational
```

### 2. Use Postman (Recommended)
- Import provided Postman collection
- All requests are pre-configured
- Environment variables automatically managed

Or use **cURL** commands below for command-line testing.

---

## Test Suite Workflow

### Phase 1: Authentication ✅

#### 1.1 Register a New User

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "65a1b2c3d4e5f6",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Save the token for next requests.**

#### 1.2 Login User

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "TestPass123!"
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "65a1b2c3d4e5f6",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**⚠️ IMPORTANT:** Copy the token value. You'll need it for all remaining requests.

```bash
export TOKEN="your_token_here"
```

#### 1.3 Get User Profile

**cURL:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "userId": "65a1b2c3d4e5f6",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-03-15T10:30:00.000Z"
  }
}
```

---

### Phase 2: Transactions

#### 2.1 Create Income Transaction

**cURL:**
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 75000,
    "description": "Monthly salary",
    "type": "income",
    "category": "Salary",
    "date": "2024-03-01"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transactionId": "65a1b2c3d4e5f7",
    "amount": 75000,
    "type": "income",
    "category": "Salary"
  }
}
```

**⚠️ Save the transactionId for reference.**

#### 2.2 Create Multiple Expense Transactions

**Rent:**
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 30000,
    "description": "Apartment rent",
    "type": "expense",
    "category": "Rent",
    "date": "2024-03-01"
  }'
```

**Groceries:**
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 8000,
    "description": "Weekly groceries",
    "type": "expense",
    "category": "Food",
    "date": "2024-03-05"
  }'
```

**Transportation:**
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 5000,
    "description": "Fuel and maintenance",
    "type": "expense",
    "category": "Transport",
    "date": "2024-03-08"
  }'
```

#### 2.3 Get All Transactions

**cURL:**
```bash
curl -X GET http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "transactionId": "65a1b2c3d4e5f7",
      "amount": 75000,
      "type": "income",
      "category": "Salary",
      "date": "2024-03-01"
    },
    {
      "transactionId": "65a1b2c3d4e5f8",
      "amount": 30000,
      "type": "expense",
      "category": "Rent",
      "date": "2024-03-01"
    },
    // ... more transactions
  ]
}
```

#### 2.4 Get Transaction Summary

**cURL:**
```bash
curl -X GET http://localhost:5000/api/transactions/summary \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Transaction summary retrieved successfully",
  "data": {
    "totalIncome": 75000,
    "totalExpenses": 43000,
    "netBalance": 32000,
    "transactionCount": 4
  }
}
```

---

### Phase 3: Goals

#### 3.1 Create Financial Goal

**cURL:**
```bash
curl -X POST http://localhost:5000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "goalTitle": "Buy a Car",
    "description": "Save for a new sedan",
    "targetAmount": 500000,
    "currentSavings": 100000,
    "deadline": "2026-12-31",
    "category": "Vehicle"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Goal created successfully",
  "data": {
    "goalId": "65a1b2c3d4e5f9",
    "goalTitle": "Buy a Car",
    "targetAmount": 500000,
    "currentSavings": 100000,
    "amountLeft": 400000,
    "deadline": "2026-12-31"
  }
}
```

**⚠️ Save the goalId. You'll need it for the Planner features.**

#### 3.2 Create Additional Goals

**Emergency Fund:**
```bash
curl -X POST http://localhost:5000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "goalTitle": "Emergency Fund",
    "description": "6 months of expenses",
    "targetAmount": 300000,
    "currentSavings": 150000,
    "deadline": "2025-12-31",
    "category": "Emergency"
  }'
```

**Vacation:**
```bash
curl -X POST http://localhost:5000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "goalTitle": "International Vacation",
    "description": "Trip to Europe",
    "targetAmount": 200000,
    "currentSavings": 50000,
    "deadline": "2025-06-30",
    "category": "Travel"
  }'
```

#### 3.3 Get All Goals

**cURL:**
```bash
curl -X GET http://localhost:5000/api/goals \
  -H "Authorization: Bearer $TOKEN"
```

#### 3.4 Get Specific Goal

**cURL:**
```bash
curl -X GET http://localhost:5000/api/goals/65a1b2c3d4e5f9 \
  -H "Authorization: Bearer $TOKEN"
```

---

### Phase 4: NEW - Savings Planner 🆕

#### 4.1 Generate Savings Plan

**cURL:**
```bash
curl -X POST http://localhost:5000/api/planner/generate-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "goalId": "65a1b2c3d4e5f9"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Savings plan generated successfully",
  "data": {
    "planId": "65a1b2c3d4e5fa",
    "goalTitle": "Buy a Car",
    "requiredMonthlySavings": 16667,
    "feasible": true,
    "currentMonthlyIncome": 75000,
    "currentMonthlyExpenses": 43000,
    "availableAmount": 32000,
    "suggestion": "Your goal is achievable with your current income and expenses!",
    "alternativeScenarios": [
      {
        "scenarioName": "Accelerated Plan (6 months earlier)",
        "monthlySavings": 20833,
        "adjustmentPercent": 25,
        "description": "Achieve goal 6 months earlier by saving ₹20,833"
      },
      {
        "scenarioName": "Extended Plan (6 months later)",
        "monthlySavings": 13889,
        "adjustmentPercent": -17,
        "description": "Achieve goal with reduced monthly savings of ₹13,889"
      },
      {
        "scenarioName": "Reduced Target (80% of goal)",
        "monthlySavings": 13333,
        "adjustmentPercent": -20,
        "description": "Achieve 80% of goal (₹4,00,000) with ₹13,333"
      }
    ]
  }
}
```

**✅ VERIFICATION:** 
- `requiredMonthlySavings` = (500000 - 100000) / 24 months = 16,667 ✓
- `feasible` = availableAmount (32000) >= requiredMonthlySavings (16667) = true ✓
- Alternative scenarios show 3 different strategies ✓

#### 4.2 Get All Plans

**cURL:**
```bash
curl -X GET "http://localhost:5000/api/planner/plans?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Plans retrieved successfully",
  "data": {
    "plans": [
      {
        "_id": "65a1b2c3d4e5fa",
        "goalTitle": "Buy a Car",
        "requiredMonthlySavings": 16667,
        "feasible": true,
        // ... full plan data
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### 4.3 Get Specific Plan

**cURL:**
```bash
curl -X GET http://localhost:5000/api/planner/plans/65a1b2c3d4e5fa \
  -H "Authorization: Bearer $TOKEN"
```

#### 4.4 Delete Plan

**cURL:**
```bash
curl -X DELETE http://localhost:5000/api/planner/plans/65a1b2c3d4e5fa \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Plan deleted successfully"
}
```

---

### Phase 5: NEW - Financial Reports 🆕

#### 5.1 Get Monthly Report

**Current Month:**
```bash
curl -X GET http://localhost:5000/api/reports/monthly \
  -H "Authorization: Bearer $TOKEN"
```

**Specific Month (March 2024):**
```bash
curl -X GET "http://localhost:5000/api/reports/monthly?month=2&year=2024" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Monthly report retrieved successfully",
  "data": {
    "month": 2,
    "year": 2024,
    "income": 75000,
    "expenses": 43000,
    "balance": 32000,
    "savingsRate": 43,
    "transactionCount": 4,
    "startDate": "2024-03-01",
    "endDate": "2024-03-31"
  }
}
```

**✅ VERIFICATION:**
- `balance` = income (75000) - expenses (43000) = 32000 ✓
- `savingsRate` = (balance / income) * 100 = 43% ✓

#### 5.2 Get Spending Categories Report

**cURL:**
```bash
curl -X GET "http://localhost:5000/api/reports/spending-categories?month=2&year=2024" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Spending categories report retrieved successfully",
  "data": {
    "month": 2,
    "year": 2024,
    "totalExpenses": 43000,
    "categoryBreakdown": [
      {
        "category": "Rent",
        "amount": 30000,
        "percentage": 70
      },
      {
        "category": "Food",
        "amount": 8000,
        "percentage": 19
      },
      {
        "category": "Transport",
        "amount": 5000,
        "percentage": 12
      }
    ],
    "topCategory": {
      "category": "Rent",
      "amount": 30000,
      "percentage": 70
    }
  }
}
```

**✅ VERIFICATION:**
- All percentages sum to ~100% ✓
- Top category is correctly identified ✓

#### 5.3 Get Savings Progress Report

**cURL:**
```bash
curl -X GET http://localhost:5000/api/reports/savings-progress \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Savings progress report retrieved successfully",
  "data": {
    "totalGoals": 3,
    "totalTargetAmount": 1000000,
    "totalSavedTowardsGoals": 300000,
    "overallProgress": 30,
    "goals": [
      {
        "goalId": "65a1b2c3d4e5f9",
        "goalTitle": "Buy a Car",
        "targetAmount": 500000,
        "currentSavings": 100000,
        "amountLeft": 400000,
        "progress": 20,
        "deadline": "2026-12-31",
        "daysLeft": 678,
        "onTrack": true
      },
      {
        "goalId": "65a1b2c3d4e5fa",
        "goalTitle": "Emergency Fund",
        "targetAmount": 300000,
        "currentSavings": 150000,
        "amountLeft": 150000,
        "progress": 50,
        "deadline": "2025-12-31",
        "daysLeft": 293,
        "onTrack": true
      },
      {
        "goalId": "65a1b2c3d4e5fb",
        "goalTitle": "International Vacation",
        "targetAmount": 200000,
        "currentSavings": 50000,
        "amountLeft": 150000,
        "progress": 25,
        "deadline": "2025-06-30",
        "daysLeft": 108,
        "onTrack": true
      }
    ]
  }
}
```

**✅ VERIFICATION:**
- `overallProgress` = (300000 / 1000000) * 100 = 30% ✓
- Each goal shows progress percentage correctly ✓
- `onTrack` status calculated properly ✓

#### 5.4 Get Financial Summary

**cURL:**
```bash
curl -X GET http://localhost:5000/api/reports/summary \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Financial summary retrieved successfully",
  "data": {
    "currentMonth": {
      "income": 75000,
      "expenses": 43000,
      "balance": 32000,
      "savingsRate": 43
    },
    "threeMonthAverage": {
      "monthlyIncome": 75000,
      "monthlyExpenses": 42333,
      "monthlySavings": 32667
    },
    "goals": {
      "totalGoals": 3,
      "totalSavingsGoal": 1000000,
      "totalSavedTowardsGoals": 300000,
      "progressPercentage": 30
    },
    "topExpenseCategories": [
      {
        "category": "Rent",
        "amount": 30000
      },
      {
        "category": "Food",
        "amount": 8000
      },
      {
        "category": "Transport",
        "amount": 5000
      }
    ]
  }
}
```

---

## Error Testing

### Test Invalid Token
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer invalid_token"
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Access token is required",
  "errors": []
}
```

### Test Missing Required Field
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 5000,
    "type": "expense"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["description is required"]
}
```

### Test Invalid Query Parameters
```bash
curl -X GET "http://localhost:5000/api/reports/monthly?month=13&year=2024" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Month must be between 0 and 11",
  "errors": []
}
```

---

## Performance Testing

### Load Test with Multiple Goals
Create 10 goals and test report generation:

```bash
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/goals \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"goalTitle\": \"Goal $i\",
      \"targetAmount\": $((100000 * i)),
      \"currentSavings\": $((10000 * i)),
      \"deadline\": \"2025-12-31\",
      \"category\": \"Personal\"
    }" \
    --silent > /dev/null
done

echo "Created 10 goals"

# Now test report speed
time curl -X GET http://localhost:5000/api/reports/summary \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response Time:** < 500ms

---

## Integration Testing Checklist

- [ ] User can register successfully
- [ ] User can login and receive token
- [ ] Token works for authenticated endpoints
- [ ] Invalid token is rejected
- [ ] User can create multiple transactions
- [ ] Transaction summary is accurate
- [ ] User can create multiple goals
- [ ] Savings plan calculates correct monthly savings
- [ ] Feasibility flag is accurate
- [ ] Alternative scenarios generated correctly
- [ ] Monthly report shows correct calculations
- [ ] Category breakdown sums to total expenses
- [ ] Savings progress sums to total goals
- [ ] Financial summary aggregates all metrics
- [ ] Error responses follow standard format
- [ ] Validation errors are descriptive
- [ ] Reports handle missing data gracefully

---

## Data Cleanup (Testing)

To reset test data:

```bash
# Delete all transactions
curl -X DELETE http://localhost:5000/api/transactions \
  -H "Authorization: Bearer $TOKEN"

# Delete specific goal
curl -X DELETE http://localhost:5000/api/goals/65a1b2c3d4e5f9 \
  -H "Authorization: Bearer $TOKEN"

# Delete specific plan
curl -X DELETE http://localhost:5000/api/planner/plans/65a1b2c3d4e5fa \
  -H "Authorization: Bearer $TOKEN"
```

---

## Success Criteria

✅ All 20 endpoints respond correctly  
✅ Financial calculations are accurate  
✅ Error handling is consistent  
✅ Response times are acceptable  
✅ Data persistence works properly  
✅ Token authentication works  
✅ Validation catches invalid data  

**Testing complete!** 🎉
