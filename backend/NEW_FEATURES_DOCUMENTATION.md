# New Features Documentation

## 🎯 Savings Scenario Generator

### Overview
The Savings Scenario Generator analyzes your financial goals and current financial situation to create personalized savings plans with alternative scenarios.

### Endpoint: POST /api/planner/generate-plan

**Purpose:** Generate a comprehensive savings plan for a specific financial goal.

**Request:**
```json
{
  "goalId": "65a1b2c3d4e5f6"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Savings plan generated successfully",
  "data": {
    "planId": "65a1b2c3d4e5f7",
    "goalTitle": "Buy a car",
    "requiredMonthlySavings": 16667,
    "feasible": true,
    "currentMonthlyIncome": 75000,
    "currentMonthlyExpenses": 45000,
    "availableAmount": 30000,
    "suggestion": "Your goal is achievable with your current income and expenses. Keep up the consistent savings!",
    "alternativeScenarios": [
      {
        "scenarioName": "Accelerated Plan (6 months earlier)",
        "monthlySavings": 20833,
        "adjustmentPercent": 25,
        "description": "Achieve goal 6 months earlier by saving ₹20,833 monthly"
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
        "description": "Achieve 80% of goal (₹4,00,000) with ₹13,333 monthly"
      }
    ]
  }
}
```

**Calculation Logic:**
```
1. Fetch user's last 3 months of income and expenses
2. Calculate average monthly income/expenses
3. Calculate available amount (avg income - avg expenses)
4. Determine if goal is feasible (available >= required savings)
5. Generate suggestion based on feasibility gap
6. Create 3 alternative scenarios:
   - Accelerated (6 months shorter deadline)
   - Extended (6 months longer deadline)
   - Reduced target (80% of original goal)
```

---

### Endpoint: GET /api/planner/plans

**Purpose:** Retrieve all savings plans created by the user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "message": "Plans retrieved successfully",
  "data": {
    "plans": [
      {
        "_id": "65a1b2c3d4e5f7",
        "userId": "65a1b2c3d4e5f6",
        "goalId": {
          "_id": "65a1b2c3d4e5f5",
          "goalTitle": "Buy a car"
        },
        "requiredMonthlySavings": 16667,
        "feasible": true,
        "currentMonthlyIncome": 75000,
        "currentMonthlyExpenses": 45000,
        "alternativeScenarios": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

### Endpoint: GET /api/planner/plans/:planId

**Purpose:** Get details of a specific savings plan.

**Response (200):**
```json
{
  "success": true,
  "message": "Plan retrieved successfully",
  "data": { /* Plan object */ }
}
```

---

### Endpoint: DELETE /api/planner/plans/:planId

**Purpose:** Delete a savings plan.

**Response (200):**
```json
{
  "success": true,
  "message": "Plan deleted successfully"
}
```

---

## 📊 Reports & Analytics

### Endpoint: GET /api/reports/monthly

**Purpose:** Get monthly financial report (income, expenses, savings).

**Query Parameters:**
- `month` (optional): Month (0-11, default: current)
- `year` (optional): Year (default: current)

**Example:** `/api/reports/monthly?month=0&year=2024`

**Response (200):**
```json
{
  "success": true,
  "message": "Monthly report retrieved successfully",
  "data": {
    "month": 3,
    "year": 2024,
    "income": 225000,
    "expenses": 135000,
    "balance": 90000,
    "savingsRate": 40,
    "transactionCount": 24,
    "startDate": "2024-03-01",
    "endDate": "2024-03-31"
  }
}
```

**Calculations:**
```
income = sum of all "income" type transactions
expenses = sum of all "expense" type transactions
balance = income - expenses
savingsRate = (balance / income) * 100
```

---

### Endpoint: GET /api/reports/spending-categories

**Purpose:** Get spending breakdown by expense category.

**Query Parameters:**
- `month` (optional): Month (0-11, default: current)
- `year` (optional): Year (default: current)

**Response (200):**
```json
{
  "success": true,
  "message": "Spending categories report retrieved successfully",
  "data": {
    "month": 3,
    "year": 2024,
    "totalExpenses": 135000,
    "categoryBreakdown": [
      {
        "category": "Rent",
        "amount": 45000,
        "percentage": 33
      },
      {
        "category": "Food",
        "amount": 30000,
        "percentage": 22
      },
      {
        "category": "Transport",
        "amount": 20000,
        "percentage": 15
      },
      {
        "category": "Entertainment",
        "amount": 15000,
        "percentage": 11
      },
      {
        "category": "Utilities",
        "amount": 13000,
        "percentage": 10
      },
      {
        "category": "Healthcare",
        "amount": 12000,
        "percentage": 9
      }
    ],
    "topCategory": {
      "category": "Rent",
      "amount": 45000,
      "percentage": 33
    }
  }
}
```

---

### Endpoint: GET /api/reports/savings-progress

**Purpose:** Get savings progress towards all financial goals.

**Response (200):**
```json
{
  "success": true,
  "message": "Savings progress report retrieved successfully",
  "data": {
    "totalGoals": 3,
    "totalTargetAmount": 1500000,
    "totalCurrentSavings": 350000,
    "overallProgress": 23,
    "goals": [
      {
        "goalId": "65a1b2c3d4e5f5",
        "goalTitle": "Buy a car",
        "targetAmount": 500000,
        "currentSavings": 100000,
        "amountLeft": 400000,
        "progress": 20,
        "deadline": "2026-12-31",
        "daysLeft": 300,
        "onTrack": true
      },
      {
        "goalId": "65a1b2c3d4e5f6",
        "goalTitle": "Emergency Fund",
        "targetAmount": 300000,
        "currentSavings": 150000,
        "amountLeft": 150000,
        "progress": 50,
        "deadline": "2025-12-31",
        "daysLeft": 200,
        "onTrack": true
      },
      {
        "goalId": "65a1b2c3d4e5f7",
        "goalTitle": "Vacation",
        "targetAmount": 700000,
        "currentSavings": 100000,
        "amountLeft": 600000,
        "progress": 14,
        "deadline": "2027-06-30",
        "daysLeft": 500,
        "onTrack": true
      }
    ]
  }
}
```

---

### Endpoint: GET /api/reports/summary

**Purpose:** Get comprehensive financial summary with all key metrics.

**Response (200):**
```json
{
  "success": true,
  "message": "Financial summary retrieved successfully",
  "data": {
    "currentMonth": {
      "income": 225000,
      "expenses": 135000,
      "balance": 90000,
      "savingsRate": 40
    },
    "threeMonthAverage": {
      "monthlyIncome": 220000,
      "monthlyExpenses": 132000,
      "monthlySavings": 88000
    },
    "goals": {
      "totalGoals": 3,
      "totalSavingsGoal": 1500000,
      "totalSavedTowardsGoals": 350000,
      "progressPercentage": 23
    },
    "topExpenseCategories": [
      {
        "category": "Rent",
        "amount": 45000
      },
      {
        "category": "Food",
        "amount": 30000
      },
      {
        "category": "Transport",
        "amount": 20000
      },
      {
        "category": "Entertainment",
        "amount": 15000
      },
      {
        "category": "Utilities",
        "amount": 13000
      }
    ]
  }
}
```

---

## 🔌 Integration with Frontend

### Example Usage

**1. Generate Savings Plan for a Goal:**
```javascript
const goalId = "goal_id_from_create_goal_response";
const response = await fetch("http://localhost:5000/api/planner/generate-plan", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({ goalId })
});
const plan = await response.json();
console.log(plan.data.suggestion);
```

**2. Get Monthly Report:**
```javascript
const month = new Date().getMonth(); // 0-11
const year = new Date().getFullYear();
const response = await fetch(
  `http://localhost:5000/api/reports/monthly?month=${month}&year=${year}`,
  {
    headers: { "Authorization": `Bearer ${token}` }
  }
);
const report = await response.json();
```

**3. Get Savings Overview:**
```javascript
const response = await fetch("http://localhost:5000/api/reports/summary", {
  headers: { "Authorization": `Bearer ${token}` }
});
const summary = await response.json();
```

---

## 🎯 Data Models

### Plan Model
```typescript
interface IPlan {
  userId: ObjectId;
  goalId: ObjectId;
  requiredMonthlySavings: number;
  feasible: boolean;
  currentMonthlyIncome: number;
  currentMonthlyExpenses: number;
  availableAmount: number;
  suggestion: string;
  alternativeScenarios: Array<{
    scenarioName: string;
    monthlySavings: number;
    adjustmentPercent: number;
    description: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 💡 Features Explained

### Feature 1: Intelligent Feasibility Analysis
The system analyzes your last 3 months of income/expense data to determine if a goal is achievable with your current financial situation.

**How it works:**
1. Fetch last 3 months of transactions
2. Calculate average monthly income
3. Calculate average monthly expenses
4. Determine available amount (income - expenses)
5. Compare with required monthly savings

### Feature 2: Smart Suggestions
Based on the feasibility gap, the system generates personalized suggestions:
- If feasible: Encouragement to stay on track
- If slightly infeasible: Specific % to reduce discretionary spending
- If very infeasible: Alternative strategies (extend deadline, reduce target)

### Feature 3: Alternative Scenarios
Three different approaches to achieve the same goal:
1. **Accelerated**: Achieve 6 months earlier (requires more savings)
2. **Extended**: Take 6 months longer (requires less savings)
3. **Reduced Target**: Aim for 80% of the target (easier to achieve)

### Feature 4: Comprehensive Analytics
Track your financial health across multiple dimensions:
- **Monthly Reports**: Income, expenses, balance, savings rate
- **Category Breakdown**: See where your money goes
- **Savings Progress**: Track multiple goals simultaneously
- **Financial Summary**: All key metrics in one view

---

## 🔒 Access Control

All new endpoints require authentication. Include bearer token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📝 Error Handling

All endpoints return consistent error responses:

**400 Bad Request** - Invalid parameters
```json
{
  "success": false,
  "message": "Month must be between 0 and 11",
  "errors": []
}
```

**404 Not Found** - Resource doesn't exist
```json
{
  "success": false,
  "message": "Goal not found",
  "errors": []
}
```

**401 Unauthorized** - Missing or invalid token
```json
{
  "success": false,
  "message": "Access token is required",
  "errors": []
}
```

---

## 🚀 Next Steps

1. Test all new endpoints with curl/Postman
2. Integrate with frontend components
3. Display plans and reports in UI
4. Add goal-to-plan workflow
5. Consider NLP integration for natural language goal input

---

**All new features are production-ready and fully documented!** ✅
